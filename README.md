# DGSVis: Visual Analysis of Hierarchical Snapshots in Dynamic Graph ( IEEE VIS 2022 Review Track)
This repository contains source code used to explore and analyze the hierarchical snapshots of dynamic graph data.

## Introduction
We propose this work to analyze the large-scale and time-intensive dynamic graph data with subtle changes. Based on this type of dynamic graph data, we present a complete three-step workflow in this work.
To help users access the insights, we design an interactive visual analysis prototype system, named DGSVis. In the end, we introduce case studies to illustrate the usability of this work based on basketball player network data.

Video Introduction: [DGSVis](https://youtu.be/kpBpfko1_zs)

## Workflow
In this work, we present a complete three-step workflow including feature extraction, snapshot generation, and visual analysis. In the feature extraction part, we extract vectors, attributes, and indicators for each graph/snapshot. In the snapshot generation part, we propose an algorithm to generate hierarchical snapshots of dynamic graphs. In visual analysis, we design an interactive visual analysis prototype system (DGSVis).
<img src="https://github.com/BaofengChang/DGSVis/raw/main/Figs/workflow.jpg" height="400px" width="800px">

## System Interface
DGSVis integrates multiple interactive diagrams to help users access the insights of dynamic graphs. DGSVis is equipped with a matrix diagram (a) and scatter plot (b) to present overviews of player networks, an event diagram (c) to integrate event data of player networks, a snapshot tree (d) to provide users with an operation interface to generate hierarchical snapshots interactively, a node-link diagram (e) to show the detailed topology structures and movement trajectories, and line charts (f) to display the detailed attributes of player networks.
<img src="https://github.com/BaofengChang/DGSVis/raw/main/Figs/teaser.jpg" height="400px" width="800px">

## Contribution
The contributions of this work can be summarized as follows:
* We propose a snapshot generation algorithm, which involves the degrees of graph change to help users generate hierarchical and multi-granularity snapshots of large-scale, time-intensive dynamic graph data with subtle changes for further analysis.
* We present a workflow in the visual analysis of the dynamic graph data, which involves a complete three-step pipeline including feature extraction, snapshot generation, and visual analysis to help people employ and analyze dynamic graph data conveniently.
* We design an interactive visual analysis prototype system integrating multiple diagrams to help users analyze the dynamic graph data by providing interactive snapshot generation operation flow, macro-level graph overview, and micro-level graph details.



