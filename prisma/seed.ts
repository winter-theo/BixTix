// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed en cours...");

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.license.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "BixTix Starter",
        slug: "bixtix-starter",
        description:
          "Idéal pour les petites équipes TI jusqu'à 5 utilisateurs. Gestion de base des tickets de support.",
        price: 49.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Starter",
      },
      {
        name: "BixTix Pro",
        slug: "bixtix-pro",
        description:
          "Pour les équipes TI moyennes jusqu'à 25 utilisateurs. Inclut les rapports avancés et les automatisations.",
        price: 149.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Pro",
      },
      {
        name: "BixTix Enterprise",
        slug: "bixtix-enterprise",
        description:
          "Pour les grandes organisations. Utilisateurs illimités, SLA prioritaire, intégrations sur mesure.",
        price: 499.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Enterprise",
      },
      {
        name: "BixTix Cloud",
        slug: "bixtix-cloud",
        description:
          "Version SaaS hébergée de BixTix. Aucune installation requise, mises à jour automatiques.",
        price: 89.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Cloud",
      },
      {
        name: "BixTix Mobile",
        slug: "bixtix-mobile",
        description:
          "Application mobile compagnon pour gérer vos tickets en déplacement. iOS et Android.",
        price: 29.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Mobile",
      },
      {
        name: "BixTix Analytics",
        slug: "bixtix-analytics",
        description:
          "Module d'analyse avancée pour suivre les KPI de votre équipe support et identifier les goulots.",
        price: 199.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Analytics",
      },
      {
        name: "BixTix Integrations Pack",
        slug: "bixtix-integrations",
        description:
          "Pack d'intégrations avec Slack, Microsoft Teams, Jira, GitHub et plus de 30 outils populaires.",
        price: 79.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Integrations",
      },
      {
        name: "BixTix Security Add-on",
        slug: "bixtix-security",
        description:
          "Module de sécurité avancée : SSO, audit logs, conformité RGPD et SOC 2.",
        price: 249.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Security",
      },
      {
        name: "BixTix AI Assistant",
        slug: "bixtix-ai",
        description:
          "Assistant IA qui suggère des réponses, classe les tickets automatiquement et détecte les urgences.",
        price: 159.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+AI",
      },
      {
        name: "BixTix Training",
        slug: "bixtix-training",
        description:
          "Formation en ligne pour vos agents : 10h de contenu vidéo et certification incluse.",
        price: 39.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Training",
      },
      {
        name: "BixTix Support Premium",
        slug: "bixtix-support-premium",
        description:
          "Support prioritaire 24/7 avec SLA garanti de 1h pour les tickets critiques.",
        price: 299.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Support",
      },
      {
        name: "BixTix Legacy (archive)",
        slug: "bixtix-legacy",
        description:
          "Ancienne version de BixTix maintenue pour les clients historiques. Plus en vente active.",
        price: 19.99,
        imageUrl: "https://placehold.co/400x300?text=BixTix+Legacy",
        isActive: false,
      },
    ],
  });

  console.log("Seed termine !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });