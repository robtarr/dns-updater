## DNS Updater

This thing can sit on your home network somewhere and will periodically check your public IP. From there it will use DNSimple to update a DNS entry.

## Setup
You can run this project via Docker incredibly simply:

1. Create a `.env` file using this [example][dot-env-example]. `wget -O .env https://raw.githubusercontent.com/cromwellryan/dns-updater/main/.env.example` 
2. Run the app via `docker run --rm cromwellryan/dns-updater`

## Todo
- [x] Determine Public IP
- [x] Update DNSimple
- [x] Make it configurable
- [x] Package for deployment via Docker
- [ ] Choose a scheduler or process monitor

[dot-env-example]: https://raw.githubusercontent.com/cromwellryan/dns-updater/main/.env.example
