#!/bin/bash -x
which functions
functions config set projectId test_project
functions start
functions clear
functions deploy api -H
functions stop
