# WorkAdventure Configuration Personnelle

Ce dépôt contient ma configuration personnelle pour faire fonctionner WorkAdventure sur le port 80.

## 🎮 Fonctionnalités testées et validées

- ✅ **Création de nom** (ex: sam)
- ✅ **Sélection de personnage** (personnage féminin)
- ✅ **50 pas de mouvement** sur la carte
- ✅ **Aucune erreur bloquante**
- ✅ **Canvas du jeu détecté**
- ✅ **Moteur Phaser fonctionnel**

## 📁 Fichiers de configuration

- `docker-compose.override.yml` - Configuration Docker pour port 80
- `test-complet-workadventure.js` - Test automatisé complet avec Playwright
- `instructions.md` - Guide d'installation pas à pas

## 🚀 Installation rapide

1. **Cloner WorkAdventure officiel :**
   ```bash
   git clone https://github.com/thecodingmachine/workadventure.git workadventure-src
   cd workadventure-src
   ```

2. **Copier ma configuration :**
   ```bash
   cp ../workadventure-config-personal/docker-compose.override.yml .
   ```

3. **Modifier le fichier .env :**
   ```bash
   cp .env.template .env
   # Modifier START_ROOM_URL pour enlever le port
   ```

4. **Lancer WorkAdventure :**
   ```bash
   docker-compose up -d
   ```

5. **Attendre 2-3 minutes** puis accéder à :
   - http://play.workadventure.localhost/
   - http://localhost/

## 🧪 Test automatisé

Pour tester que tout fonctionne :
```bash
npm install playwright
node test-complet-workadventure.js
```

## 📍 URLs de jeu

- **Principal :** http://play.workadventure.localhost/
- **Alternative :** http://localhost/

## 🔧 Configuration DNS (si nécessaire)

Voir le fichier `instructions.md` pour la configuration du fichier hosts si vous avez des problèmes de résolution DNS.

## 📝 Notes

- Port 80 requis (désactiver autres services sur ce port)
- Docker et Docker Compose nécessaires
- Testé avec succès le 17/06/2025