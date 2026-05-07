Vertical Slice layout (backend)

This backend has been reorganized into feature-based packages under:

- `edu.cit.salindato.workforceportal.features.auth` - auth controller, service, repository, dto, model
- `edu.cit.salindato.workforceportal.features.attendance` - attendance controller, service, repository, model
- `edu.cit.salindato.workforceportal.features.leave` - leave request controller, service, repository, dto, model

Notes:
- Existing security utilities remain under `edu.cit.salindato.workforceportal.security`.
- The package refactor preserves APIs; the controllers keep the same request mappings.
