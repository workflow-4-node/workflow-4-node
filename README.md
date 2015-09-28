# Workflow 4 Node (LGPL-3.0) - PRERELEASE

# About

(Foreword from [Basic Concepts @ Wiki](https://github.com/workflow-4-node/workflow-4-node/wiki/Basic-Concepts))

Workflow is a state machine. You can imagine it as a flow chart running inside in your application, and when it reach a decision point, you can invoke a method to provide an answer that chooses the right path of execution from there. So workflow is a graph of control flow, and activities are its nodes. They can be as simple like an if..then..else branch, or as complex like getting data from a database and do something complicated depending on the results.

A workflow is an application running inside in your application, have its state and variables, and correlated across Node.js cluster and process instances. So if your Node.js application consists of many instances inside a cluster and many clusters across a server farm, a workflow instance will work like a single instance application within those. A workflow application could outlive Node.js applications, they have out-of-the-box persistence support to make them ideal platform to do **long running business processes**, **durable services** or **scheduled backgound tasks**.

There are excellent workflow framework implementations for each major platform, and one of the best is [Microsoft Workflow Foundation for the .NET Framework](https://msdn.microsoft.com/en-us/library/ee342461.aspx). If you happen to read [its introduction article](https://msdn.microsoft.com/en-us/library/dd851337.aspx) then you will have a picture of what Workflow 4 Node is about, because it was inspired by MS WF.

## Install

```bash
npm install workflow-4-node --save
```
## Docs and Tutorials

Wiki gets started to have its content, please find articles and the documentation [there](https://github.com/workflow-4-node/workflow-4-node/wiki).
