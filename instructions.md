# Instructions détaillées - Configuration WorkAdventure Port 80

## 🔧 Prérequis

- Docker installé
- Docker Compose installé
- Port 80 disponible (arrêter Apache, Nginx, Dolibarr, etc.)
- Git installé

## 📋 Installation complète étape par étape

### 1. Cloner WorkAdventure

```bash
cd /mnt/d/workadventurev4  # ou votre répertoire de travail
git clone https://github.com/thecodingmachine/workadventure.git workadventure-src
cd workadventure-src
```

### 2. Créer le fichier .env

```bash
cp .env.template .env
```

Modifier `.env` :
```
START_ROOM_URL=/_/global/maps.workadventure.localhost/starter/map.json
```
(Enlever le `:8080` s'il y est)

### 3. Modifier docker-compose.yaml

Changer la ligne du port dans `docker-compose.yaml` :
```yaml
ports:
  - "80:80"  # au lieu de "8080:80"
```

### 4. Copier le fichier override

Copier le fichier `docker-compose.override.yml` de ce dépôt dans le répertoire workadventure-src.

### 5. Configuration DNS (si nécessaire)

Si vous avez des problèmes de résolution DNS, modifier le fichier hosts :

**Windows (PowerShell Admin) :**
```powershell
notepad C:\Windows\System32\drivers\etc\hosts
```

**Linux/WSL :**
```bash
sudo nano /etc/hosts
```

Ajouter :
```
127.0.0.1 play.workadventure.localhost
127.0.0.1 front.workadventure.localhost
127.0.0.1 room-api.workadventure.localhost
127.0.0.1 maps.workadventure.localhost
127.0.0.1 oidc.workadventure.localhost
127.0.0.1 map-storage.workadventure.localhost
127.0.0.1 xmpp.workadventure.localhost
127.0.0.1 matrix.workadventure.localhost
127.0.0.1 pusher.workadventure.localhost
127.0.0.1 uploader.workadventure.localhost
127.0.0.1 icon.workadventure.localhost
127.0.0.1 redis.workadventure.localhost
127.0.0.1 traefik.workadventure.localhost
```

### 6. Lancer WorkAdventure

```bash
cd workadventure-src
docker-compose up -d
```

### 7. Attendre le démarrage

Attendre 2-3 minutes que tous les services démarrent. Vérifier avec :
```bash
docker-compose ps
```

### 8. Accéder au jeu

Ouvrir dans votre navigateur :
- http://play.workadventure.localhost/
- ou http://localhost/

### 9. Jouer !

1. Entrer votre nom (ex: sam)
2. Cliquer sur Continue
3. Sélectionner un personnage
4. Utiliser les flèches pour vous déplacer

## 🐛 Dépannage

### Erreur 502 Bad Gateway
- Attendre 2-3 minutes de plus
- Vérifier : `docker-compose logs play`

### Page qui recharge en boucle
- Vérifier que vous utilisez bien le port 80
- Vider le cache du navigateur (Ctrl+F5)

### Containers qui ne démarrent pas
```bash
docker-compose down
docker-compose up -d
```

### Vérifier les logs
```bash
docker-compose logs -f play
docker-compose logs -f reverse-proxy
```

## 🧪 Test automatisé

Pour vérifier que tout fonctionne :
```bash
npm install playwright
node test-complet-workadventure.js
```

Le test va :
- Ouvrir un navigateur
- Créer un personnage nommé "sam"
- Sélectionner un personnage
- Faire 50 pas sur la carte
- Vérifier qu'il n'y a pas d'erreurs bloquantes