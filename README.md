# vlt-atom

Atom Package to sync AEM project working copy with crx repository.

### Installation
1. Install Atom.
2. Install package
```shell
apm install vlt-atom
```
3. Add JAVA_HOME in your environment variables (if not present).

### Settings
- **AEM server host:** AEM server host or ip address.
- **AEM server port:** AEM Server port or blank if running on 80.
- **Username:** AEM admin username.
- **Password:** AEM admin password to login.
- **Vlt Base:** Vault directory path in file system. (Use the vault provided with your AEM package, under opt directory.)
- **Sync Service:** This can be used to enable service that will auto push your changes to crx.

### Usage
- Add an AEM project in Atom, right click on any directory under your project (jcr_root) and use Pull From Crx option. This will sync your working copy with AEM instance.
- Once everything is synced, options (Pull From Crx / Push To Crx) can be used to push or pull any file or directory from project panel.
