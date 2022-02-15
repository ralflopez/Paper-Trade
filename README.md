# Install

### Start postgres

`docker-compose up -d`

# Possible errors

Issue: Property 'datetime' does not exist on type 'Omit<OutputDefinitionBlock<"User">, "nonNull" | "nullable">'
Fix: check tsconfig.json settings

Issue: "Cannot read property 'user' of undefined" on apollo studio
Fix: Make sure Context is also added in apollo server
