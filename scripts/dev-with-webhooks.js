#!/usr/bin/env node

/**
 * Script de démarrage pour le développement avec support des webhooks
 * Lance automatiquement Next.js et le webhook listener en parallèle
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Démarrage de l\'environnement de développement avec webhooks');
console.log('================================================================');

// Vérifier que nous sommes dans le bon répertoire
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Erreur: package.json non trouvé. Lancez ce script depuis la racine du projet.');
  process.exit(1);
}

// Lancer Next.js dev server
console.log('🔄 Démarrage du serveur Next.js...');
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

// Afficher les logs Next.js avec préfixe
nextProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    console.log(`[NEXT] ${line}`);
  });
});

nextProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    console.log(`[NEXT] ${line}`);
  });
});

// Attendre que Next.js soit prêt avant de lancer le webhook listener
setTimeout(() => {
  console.log('');
  console.log('🎣 Démarrage du webhook listener...');
  console.log('');
  
  const webhookProcess = spawn('node', ['scripts/dev-webhook-listener.js'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  // Afficher les logs webhook listener avec préfixe
  webhookProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`[WEBHOOK] ${line}`);
    });
  });

  webhookProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`[WEBHOOK] ${line}`);
    });
  });

  // Gestion de l'arrêt propre
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt des processus...');
    nextProcess.kill('SIGINT');
    webhookProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
    webhookProcess.kill('SIGTERM');
    process.exit(0);
  });

  webhookProcess.on('close', (code) => {
    console.log(`[WEBHOOK] Processus terminé avec le code ${code}`);
  });
  
}, 3000); // Attendre 3 secondes

nextProcess.on('close', (code) => {
  console.log(`[NEXT] Processus terminé avec le code ${code}`);
});

// Afficher les instructions
console.log('');
console.log('📋 Instructions:');
console.log('- Le serveur Next.js va démarrer sur http://localhost:3000');
console.log('- Le webhook listener sera disponible pour tester les paiements');
console.log('- Utilisez Ctrl+C pour arrêter tous les processus');
console.log('');