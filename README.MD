 webpack --mode=development

 ## using private packages
[Generate token](https://github.com/settings/tokens/new) with following scopes:
- read:packages

(keep it safe for using later, **but dont commit**)


`npm login --registry=https://npm.pkg.github.com` (password is the token generated)

## dev
**In package dir**
```shell
npm link
```

**In depedent dir**
```shell
npm link [<@scope>/]<pkg>[@<version>]
```