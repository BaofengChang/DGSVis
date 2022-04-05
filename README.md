# DGSVis: Visual Analysis of Hierarchical Snapshots in Dynamic Graph ( IEEE VIS 2022 Review Track)
This repository contains source code used to explore and analyze the hierarchical snapshots of dynamic graph data.

## Introduction
We propose this work to analyze the large-scale and time-intensive dynamic graph data with subtle changes. Based on this type of dynamic graph data, we present a complete three-step workflow in this work.
To help users access the insights, we design an interactive visual analysis prototype system, named DGSVis. In the end, we introuce case studies to illustrate the usability of this work based on basketball player network data.

Video Introduction: [DGSVis](https://youtu.be/kpBpfko1_zs)

## Workflow
In this work, we present a compete three-step workflow. In feature extraction part, we extact vectors, attributes, and indicators for each graph/snapshot. In snapshot generation part, we propose an algorithm to generate hierarchical snapshots of dynamic graphs. In visual anlysis, we design an interactive visual analysis prototype system, named DGSVis.
<img src="https://github.com/BaofengChang/DGSVis/raw/main/Figs/workflow.jpg" height="400px" width="800px">

## System Interface
DGSVis integrates multiple interactive diagrams to help users access the insights of dynamic graphs. DGSVis is equipped with a matrix diagram (a) and sctter plot (b) to present overviews of player networks, an event diagram (c) to intergrate event data of player networks, a snapshot tree (d) to provide users with a operation interface to generate hierarchical snapshots interactively, a node-link diagram (e) to show the detailed topology sturctures and movement trajectories, and a line charts (f) to display the detialed player network attributes.
Systeme screenshot:
<img src="https://github.com/BaofengChang/DGSVis/raw/main/Figs/teaser.jpg" height="400px" width="800px">




