#!/bin/bash
cd /home/kavia/workspace/code-generation/template-based-powerpoint-previewer-7205-7214/ppt_generator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

