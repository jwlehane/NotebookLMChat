# Product Context: NotebookLM Chat Extension

## Overview
This Chrome extension addresses a core limitation in Google's NotebookLM: the lack of real-time collaboration. It injects a simple, real-time, threaded discussion feature directly onto each note within the NotebookLM interface, enabling teams to discuss and annotate notes in a shared context.

## User Stories
*   **View Thread:** As a user, I want to see a discussion thread attached to a specific note.
*   **Post Message:** As a user, I want to add a message to that thread with my name attributed to it.
*   **Real-time Updates:** As a user, I want to see messages from my teammates appear in real-time.
*   **Copy Thread:** As a user, I want to be able to copy the entire discussion thread (including the original note) to my clipboard to easily create a new, citable source in NotebookLM.

## Core Features
*   **Note Identification:** Uses content hashing (`simpleHash(noteContent)`) to identify notes (prototype approach).
*   **DOM Injection:** Observes `.note-view` elements and injects chat UI.
*   **Anonymous Auth:** Uses Firebase Anonymous Auth + LocalStorage display name (V1).
