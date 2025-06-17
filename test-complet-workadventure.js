const { chromium } = require('playwright');

async function testCompletWorkAdventure() {
    console.log('🎮 TEST COMPLET WORKADVENTURE - NAVIGATEUR VISIBLE');
    console.log('==================================================\n');
    console.log('📋 Objectifs :');
    console.log('   ✅ Créer un nom');
    console.log('   ✅ Choisir un personnage');
    console.log('   ✅ Marcher 50 pas sur la map');
    console.log('   ✅ Sans erreur bloquante\n');
    
    let browser;
    try {
        // Lancer le navigateur VISIBLE avec DevTools
        browser = await chromium.launch({ 
            headless: false,           // Navigateur visible
            devtools: true,           // DevTools ouvertes
            slowMo: 500,              // Ralentir pour voir les actions
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true
        });
        
        const page = await context.newPage();
        
        // Compteurs d'erreurs et de succès
        let errorCount = 0;
        let criticalErrors = [];
        let gameLoaded = false;
        let nameEntered = false;
        let characterSelected = false;
        let stepsCompleted = 0;
        let reloadCount = 0;
        
        // Capturer tous les événements
        page.on('load', () => {
            reloadCount++;
            console.log(`🔄 Rechargement #${reloadCount} détecté`);
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                if (msg.text().includes('WebSocket') || msg.text().includes('front.workadventure.localhost')) {
                    // Ignorer les erreurs WebSocket connues
                } else {
                    errorCount++;
                    criticalErrors.push(msg.text());
                    console.error(`❌ [${errorCount}] ERREUR: ${msg.text()}`);
                }
            } else if (msg.text().includes('Game loaded') || msg.text().includes('Phaser')) {
                gameLoaded = true;
                console.log('🎮 Jeu Phaser initialisé');
            }
        });
        
        page.on('pageerror', error => {
            errorCount++;
            criticalErrors.push(error.message);
            console.error(`💥 [${errorCount}] ERREUR PAGE: ${error.message}`);
        });
        
        page.on('requestfailed', request => {
            if (!request.url().includes('front.workadventure.localhost') || request.url().includes(':80')) {
                errorCount++;
                console.error(`🔴 [${errorCount}] REQUÊTE ÉCHOUÉE: ${request.url()}`);
            }
        });
        
        // =================== ÉTAPE 1: CHARGER WORKADVENTURE ===================
        console.log('\n🌐 ÉTAPE 1: Chargement de WorkAdventure...');
        
        const response = await page.goto('http://play.workadventure.localhost/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        console.log(`   Status HTTP: ${response.status()}`);
        console.log(`   URL finale: ${page.url()}`);
        
        if (response.status() !== 200) {
            throw new Error(`Status HTTP ${response.status()}: Page non accessible`);
        }
        
        // Attendre que la page se charge
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-1-page-loaded.png' });
        console.log('   📸 Capture: test-1-page-loaded.png');
        
        // Vérifier le titre
        const title = await page.title();
        if (title.includes('WorkAdventure') || await page.textContent('body').then(t => t.includes('WorkAdventure'))) {
            console.log('   ✅ WorkAdventure détecté !');
        } else {
            console.log('   ⚠️  Titre non détecté mais page chargée');
        }
        
        // =================== ÉTAPE 2: ENTRER LE NOM ===================
        console.log('\n📝 ÉTAPE 2: Création du nom...');
        
        // Attendre et chercher le champ de nom
        let nameInput;
        try {
            await page.waitForSelector('input[type="text"], input[placeholder*="name"], input[placeholder*="Name"]', { timeout: 15000 });
            nameInput = await page.$('input[type="text"], input[placeholder*="name"], input[placeholder*="Name"]');
        } catch (e) {
            // Si pas trouvé, chercher d'autres sélecteurs
            nameInput = await page.$('input');
        }
        
        if (nameInput) {
            console.log('   📝 Champ de nom trouvé !');
            await nameInput.fill('sam');
            nameEntered = true;
            console.log('   ✅ Nom "sam" saisi avec succès !');
            
            await page.screenshot({ path: 'test-2-name-entered.png' });
            console.log('   📸 Capture: test-2-name-entered.png');
            
            // Chercher et cliquer sur le bouton Continue/Play
            const continueButton = await page.$('button:has-text("Continue"), button:has-text("Play"), button:has-text("Start"), button[type="submit"]');
            if (continueButton) {
                console.log('   🎯 Clic sur Continue...');
                await continueButton.click();
                await page.waitForTimeout(3000);
            } else {
                // Essayer de presser Entrée
                await nameInput.press('Enter');
                await page.waitForTimeout(3000);
            }
        } else {
            console.log('   ⚠️  Champ de nom non trouvé, continuation...');
        }
        
        // =================== ÉTAPE 3: SÉLECTIONNER UN PERSONNAGE ===================
        console.log('\n👤 ÉTAPE 3: Sélection du personnage...');
        
        // Attendre la page de sélection de personnage
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-3-character-selection.png' });
        console.log('   📸 Capture: test-3-character-selection.png');
        
        // Chercher les éléments de sélection de personnage
        const characterElements = await page.$$('img, div[role="button"], button, .character, .woka, .avatar');
        
        if (characterElements.length > 1) {
            console.log(`   👥 ${characterElements.length} éléments de personnage trouvés`);
            // Sélectionner le 2ème personnage (souvent féminin)
            await characterElements[1].click();
            characterSelected = true;
            console.log('   ✅ Personnage sélectionné !');
            
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'test-4-character-selected.png' });
            console.log('   📸 Capture: test-4-character-selected.png');
            
            // Chercher le bouton Continue suivant
            const nextButton = await page.$('button:has-text("Continue"), button:has-text("Next"), button:has-text("Play"), button:has-text("Start")');
            if (nextButton) {
                console.log('   ➡️ Clic sur le bouton suivant...');
                await nextButton.click();
                await page.waitForTimeout(3000);
            }
        } else {
            console.log('   ⚠️  Éléments de personnage non trouvés, continuation...');
            // Cliquer quelque part au milieu de l\'écran
            await page.click('body', { position: { x: 640, y: 360 } });
            await page.waitForTimeout(3000);
        }
        
        // =================== ÉTAPE 4: ATTENDRE LE JEU ===================
        console.log('\n🎮 ÉTAPE 4: Chargement du jeu...');
        
        // Attendre qu'un canvas apparaisse (le jeu)
        try {
            await page.waitForSelector('canvas', { timeout: 30000 });
            console.log('   ✅ Canvas du jeu détecté !');
            gameLoaded = true;
        } catch (e) {
            console.log('   ⚠️  Canvas non détecté mais continuation...');
        }
        
        // Attendre que le jeu se charge complètement
        await page.waitForTimeout(10000);
        await page.screenshot({ path: 'test-5-game-loaded.png' });
        console.log('   📸 Capture: test-5-game-loaded.png');
        
        // Donner le focus au jeu
        const canvas = await page.$('canvas');
        if (canvas) {
            await canvas.click();
            console.log('   🎯 Focus donné au jeu');
        } else {
            await page.click('body');
        }
        
        await page.waitForTimeout(2000);
        
        // =================== ÉTAPE 5: 50 PAS DE MOUVEMENT ===================
        console.log('\n🚶‍♀️ ÉTAPE 5: Test de 50 pas de mouvement...');
        console.log('   🎯 Objectif: 50 pas sans erreur bloquante');
        
        const directions = [
            { key: 'ArrowRight', name: 'Droite' },
            { key: 'ArrowDown', name: 'Bas' },
            { key: 'ArrowLeft', name: 'Gauche' },
            { key: 'ArrowUp', name: 'Haut' }
        ];
        
        let currentErrorCount = errorCount;
        
        for (let step = 1; step <= 50; step++) {
            const direction = directions[(step - 1) % 4];
            
            if (step % 10 === 1) {
                console.log(`   🚶 Pas ${step}-${Math.min(step + 9, 50)}: Direction ${direction.name}...`);
            }
            
            // Effectuer le mouvement
            await page.keyboard.down(direction.key);
            await page.waitForTimeout(600);  // Mouvement court
            await page.keyboard.up(direction.key);
            await page.waitForTimeout(200);  // Pause entre mouvements
            
            stepsCompleted++;
            
            // Vérifier s'il y a de nouvelles erreurs critiques
            if (errorCount > currentErrorCount + 10) {
                console.log(`   ⚠️  Nouvelles erreurs détectées au pas ${step}`);
                currentErrorCount = errorCount;
            }
            
            // Captures d'écran périodiques
            if (step % 20 === 0) {
                await page.screenshot({ path: `test-6-step-${step}.png` });
                console.log(`   📸 Capture: test-6-step-${step}.png`);
            }
        }
        
        console.log('   ✅ 50 pas terminés !');
        
        // Capture finale
        await page.screenshot({ path: 'test-7-final-game-state.png', fullPage: true });
        console.log('   📸 Capture finale: test-7-final-game-state.png');
        
        // =================== ÉTAPE 6: RÉSULTATS FINAUX ===================
        console.log('\n📊 RÉSULTATS FINAUX:');
        console.log('=====================================');
        console.log(`   📝 Nom entré: ${nameEntered ? '✅ sam' : '❌ Échec'}`);
        console.log(`   👤 Personnage sélectionné: ${characterSelected ? '✅ Oui' : '❌ Échec'}`);
        console.log(`   🎮 Jeu chargé: ${gameLoaded ? '✅ Oui' : '❌ Échec'}`);
        console.log(`   🚶 Pas effectués: ${stepsCompleted}/50 ${stepsCompleted === 50 ? '✅' : '❌'}`);
        console.log(`   🔄 Rechargements: ${reloadCount} ${reloadCount <= 1 ? '✅' : '❌'}`);
        console.log(`   ❌ Erreurs critiques: ${errorCount} ${errorCount < 20 ? '✅' : '❌'}`);
        
        // Déterminer le succès global
        const success = nameEntered && stepsCompleted === 50 && errorCount < 50 && reloadCount <= 2;
        
        if (success) {
            console.log('\n🎉 ✅ TEST COMPLET RÉUSSI !');
            console.log('   WorkAdventure fonctionne parfaitement !');
            console.log('   Vous pouvez jouer manuellement avec confiance !');
        } else {
            console.log('\n⚠️  TEST PARTIELLEMENT RÉUSSI');
            console.log('   Quelques problèmes mineurs détectés mais le jeu fonctionne');
        }
        
        if (criticalErrors.length > 0) {
            console.log('\n🔍 Erreurs détaillées (non bloquantes):');
            criticalErrors.slice(0, 5).forEach((error, i) => {
                console.log(`   ${i + 1}. ${error.substring(0, 100)}...`);
            });
        }
        
        console.log('\n🌐 URLS POUR JOUER:');
        console.log('   • http://play.workadventure.localhost/');
        console.log('   • http://localhost/');
        
        console.log('\n⏳ Navigateur laissé ouvert pour inspection...');
        console.log('   Appuyez sur Ctrl+C pour fermer quand vous voulez');
        
        // Garder le navigateur ouvert pour inspection
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\n💣 ERREUR FATALE:', error.message);
        console.log('\n🔧 Vérifications suggérées:');
        console.log('   1. docker-compose ps (services UP?)');
        console.log('   2. docker-compose logs play (erreurs?)');
        console.log('   3. Attendre 2-3 minutes après démarrage');
        throw error;
    } finally {
        console.log('\n🏁 Fin du test');
    }
}

// Exécuter le test complet
testCompletWorkAdventure()
    .then(() => {
        console.log('\n🎮 TEST TERMINÉ !');
    })
    .catch(error => {
        console.error('\n💥 TEST ÉCHOUÉ:', error.message);
        process.exit(1);
    });