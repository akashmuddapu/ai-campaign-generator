# ai-campaign-generator

# CampaignGuard AI

AI-powered marketing campaign generator that creates persona-specific
campaign content and validates it against brand rules.

## Project Structure

- frontend/ - React application
- backend/ - Flask API
- specs/ - Specification-Driven Development artifacts
- tests/ - Integration and end-to-end tests
- docs/ - Project documentation

## Technology

Frontend:
- React
- Vite
- Tailwind CSS
- React Router
- Axios

Backend:
- Python
- Flask
- Flask-CORS
- Flask-Session

AI:
- Google Gemini API & xAI Grok API (via AI Provider Abstraction Layer)

Testing:
- Vitest
- React Testing Library
- Pytest

## Constitution & Engineering Principles

This project strictly adheres to the 13 Core Principles ratified in [.specify/memory/constitution.md](.specify/memory/constitution.md):
1. **Specification-Driven Development**: Formal specifications before implementation.
2. **Test-Driven Development (TDD)**: Mandatory test suites before code.
3. **Modular Architecture**: Clean separation between React frontend and Flask routes/services/validators/models.
4. **AI Provider Abstraction**: Pluggable Gemini and Grok support without vendor lock-in.
5. **Security & Secrets**: Server-side sessions, password hashing, environment secrets.
6. **Brand Safety**: Deterministic validation + semantic evaluation + automated fix/repair.
7. **Persona Personalization**: Genuine differentiated value propositions per persona.
8. **User Experience**: Approved design, simple onboarding, transparent asynchronous states.
9. **REST API Design**: Consistent JSON envelope and predictable status codes.
10. **Maintainability**: Single responsibility, DRY, readable for fresher developers.
11. **Git Collaboration**: Feature branch workflow, pull requests, stable `main`.
12. **MVP First**: End-to-end journey prioritized for working demonstration.
13. **Hackathon Quality**: Demo-ready, addressing judging criteria with business impact.
