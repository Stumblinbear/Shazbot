## Shazbot

A quick and dirty voice assistant that can work both locally and remotely. Supports Google TTS/STT, IBM TTS/STT, and Wit.ai STT. Uses a custom intent engine ("Conform") that includes some rudimentary NLP. Also includes a "fallback" mod that searches an online Knowledge Base if no local mod is able to resolve the query.

The name was chosen as an homage to Robin Williams: Shazbot from Mork and Mindy.

## Design Decisions

I chose NodeJS due to its simplicity. The first iteration of this began in Python, but I quickly ran into dependency issues.

## Why do we need another one??

Well, I started the project for my local network. At the time of creation, no open source projects existed for a Voice Assistant, so I just made my own. Using Mozilla Deepspeech and Espeak, it can work completely offline, even if it is a bit robotic. Now, it's just a pet project that I'll continue to develop because I find the tech fascinating.

## Mod Creation

Instead of a "skill" system, Shazbot uses Mods. The main difference is that mods can add features to the returned queries. For example: the "intent resuming" system (which allows step based skills and games) is implemented entirely using a mod.

Due to the nature of NodeJS, mods *can be malicious.* I am not resposible for the user installing a mod that harms their system.

## Installation

Just clone the project and install the NodeJS dependencies using `npm install`
