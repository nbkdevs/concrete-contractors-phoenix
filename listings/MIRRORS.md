# Codeberg and Bitbucket mirrors

Not pushed yet: no CODEBERG_TOKEN or Bitbucket credentials on the box. README already links
https://concretecontractorsphoenix.net/ in its first paragraph, so the mirror landing page carries the site link.

## Codeberg (https://codeberg.org/nbkdevs/concrete-contractors-phoenix)

1. Create the empty repo `nbkdevs/concrete-contractors-phoenix` (or via API):
   `curl -X POST -H "Authorization: token $CODEBERG_TOKEN" -H 'Content-Type: application/json' https://codeberg.org/api/v1/user/repos -d '{"name":"concrete-contractors-phoenix","description":"…","website":"https://concretecontractorsphoenix.net/"}'`
2. Push:
   ```bash
   git remote add codeberg https://codeberg.org/nbkdevs/concrete-contractors-phoenix.git
   git -c credential.helper='!f(){ echo username=nbkdevs; echo password=$CODEBERG_TOKEN; }; f' push codeberg main --tags
   ```
3. Set Website = https://concretecontractorsphoenix.net/ in repo settings.

## Bitbucket (https://bitbucket.org/nbkdevs/concrete-contractors-phoenix)

1. Create repo `concrete-contractors-phoenix` in workspace `nbkdevs` (public), Website = https://concretecontractorsphoenix.net/.
2. Push with an API token / app password (username = Bitbucket username):
   ```bash
   git remote add bitbucket https://bitbucket.org/nbkdevs/concrete-contractors-phoenix.git
   git -c credential.helper='!f(){ echo username=$BITBUCKET_USERNAME; echo password=$BITBUCKET_APP_PASSWORD; }; f' push bitbucket main --tags
   ```
