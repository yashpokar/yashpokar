---
title: How we cut infrastructure cost by ~60% with spot instances and Kubernetes
summary: Dockerising a Java monolith's satellites, moving to Spot.io Ocean, and learning to love getting your nodes taken away. A field guide to running production on hardware that can vanish in two minutes.
date: 2025-06-21
tags: [Kubernetes, AWS, Cost, Docker, Java]
---

When I joined Zivame, India's largest lingerie platform, the infrastructure looked like most mid-sized e-commerce stacks in India at the time: a set of Spring Boot services on long-lived EC2 instances, each sized for peak traffic, each running at a fraction of that most of the day. Reserved instances helped a little. Nothing helped a lot.

Over about six months we moved those services into containers and onto a Kubernetes cluster where almost every node was a spot instance. The bill dropped by roughly 60%. This post is about the parts of that journey that were not obvious going in.

## Step zero: make the services boring

You cannot run a service on hardware that disappears unless the service is comfortable being killed. Before we touched a single node we went through each service and made it stateless and restartable:

- **Sessions moved to Redis.** Anything in local memory that mattered beyond one request had to leave the process.
- **Startup got fast.** A Spring Boot app that takes ninety seconds to warm up is a liability when nodes are being reclaimed. We trimmed classpath scanning, lazy-initialised the heavy beans, and got most services under fifteen seconds.
- **Shutdown got graceful.** On `SIGTERM`, stop accepting new requests, finish in-flight ones, flush Kafka producers, then exit. Spring makes this a one-liner once you know where to look:

```yaml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 25s
```

That `25s` is not arbitrary. AWS gives you a two-minute spot interruption notice, and Kubernetes needs part of that budget to reschedule. We wanted every pod gone well before the node was.

## Spot.io Ocean, and why not plain Karpenter or ASGs

We used [Spot.io Ocean](https://spot.io/products/ocean/) as the node layer. The pitch is simple: it watches your pending pods, bids across many instance families and availability zones, and keeps a diverse fleet so that any single spot pool being reclaimed does not take out your cluster. It also predicts interruptions and proactively drains nodes before AWS does.

Could we have built this ourselves? Probably. Should a four-person platform team at an e-commerce company build it? No. The economics were obvious: the licence cost was a rounding error against the savings.

## Making Kubernetes behave on unreliable nodes

A few settings did most of the work:

**Pod Disruption Budgets** for every deployment, so a drain could never take a service to zero replicas:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: catalog-api
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: catalog-api
```

**Topology spread constraints** so replicas landed on different nodes and different zones. Three replicas on the same spot node are one replica.

**Readiness probes that told the truth.** A pod that reports ready before its connection pool is warm will serve errors the moment traffic arrives. We had readiness depend on a real dependency check, not just "the port is open".

**A small on-demand node group** for the handful of things that genuinely could not tolerate interruption: the ingress controllers and a couple of stateful components. Everything else ran on spot.

## The multi-warehouse detour

Midway through all this I ended up leading the multi-warehouse inventory project with three other engineers. It was unrelated to the cost work on paper, but in practice the two fed each other. Because every service was now containerised and horizontally scalable, standing up the new inventory service with its own Kafka consumer group and its own autoscaling was a day's work rather than a procurement ticket.

That is the hidden return on this kind of platform investment. The bill goes down, yes. But the time between "we should build this" and "it is in production" shrinks even more.

## Things that bit us

- **Java memory on containers.** Older JVMs ignore cgroup limits and size the heap off the host. Set `-XX:MaxRAMPercentage` explicitly or you will OOM in ways that make no sense.
- **Image pull time.** A 900 MB image on a fresh node adds a minute to every reschedule. We moved to layered, slimmer base images and pre-pulled the common ones.
- **Log shipping during drains.** When a node goes, the last few seconds of logs go with it unless your agent flushes aggressively. Set short flush intervals.

## Was it worth it?

Roughly 60% off the compute bill, better availability than we had before, and a platform where deploying a new service was a pull request instead of a project. The spot interruptions we were so nervous about became background noise within a month.

If your services can already be killed safely, you are most of the way there. If they cannot, that work is worth doing even if you never touch a spot instance.
