import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleHelp,
  Home,
  Info,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

export interface ShellNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface FooterLinkGroup {
  title: string;
  links: Array<{
    href: string;
    label: string;
    description?: string;
  }>;
}

export interface TrustItem {
  label: string;
  description: string;
  icon: LucideIcon;
}

export const primaryNavigation: ShellNavItem[] = [
  {
    href: "/",
    label: "Início",
    description: "Destaques e novidades",
    icon: Home,
  },
  {
    href: "/store",
    label: "Loja",
    description: "Catálogo completo",
    icon: Store,
  },
  {
    href: "/blog",
    label: "Blog",
    description: "Conteúdo especializado",
    icon: BookOpen,
  },
  {
    href: "/about",
    label: "Sobre",
    description: "Nossa história",
    icon: Info,
  },
  {
    href: "/contact",
    label: "Contato",
    description: "Fale com o time",
    icon: CircleHelp,
  },
];

export const utilityNavigation: ShellNavItem[] = [
  {
    href: "/my-account",
    label: "Minha conta",
    description: "Pedidos, dados e endereços",
    icon: UserRound,
  },
  {
    href: "/my-cart",
    label: "Carrinho",
    description: "Resumo e checkout",
    icon: ShoppingBag,
  },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Comprar",
    links: [
      { href: "/store", label: "Catálogo", description: "Produtos e categorias" },
      { href: "/my-cart", label: "Carrinho", description: "Revise sua compra" },
      { href: "/my-account", label: "Minha conta", description: "Pedidos e dados" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { href: "/blog", label: "Blog", description: "Guias e tendências" },
      { href: "/about", label: "Sobre", description: "Quem somos" },
      { href: "/contact", label: "Contato", description: "Suporte e atendimento" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { href: "/contact", label: "Atendimento", description: "Seg a sex, horário comercial" },
      { href: "/auth/login", label: "Entrar", description: "Acesse sua conta" },
      { href: "/auth/register", label: "Criar conta", description: "Finalize compras com agilidade" },
    ],
  },
];

export const trustItems: TrustItem[] = [
  {
    label: "Compra protegida",
    description: "Checkout seguro com PIX e cartão",
    icon: ShieldCheck,
  },
  {
    label: "Entrega nacional",
    description: "Operação preparada para atender todo o Brasil",
    icon: Truck,
  },
  {
    label: "Curadoria esportiva",
    description: "Produtos, conteúdo e suporte orientados por performance",
    icon: Sparkles,
  },
];

export const footerMeta = {
  supportEmail: "contato@solaresportes.com.br",
  supportLocation: "Atendimento online para todo o Brasil",
} as const;

export const footerQuickLinks = [
  {
    href: `mailto:${footerMeta.supportEmail}`,
    label: footerMeta.supportEmail,
    icon: Mail,
  },
  {
    href: "/contact",
    label: "Central de atendimento",
    icon: CircleHelp,
  },
  {
    href: "/about",
    label: footerMeta.supportLocation,
    icon: MapPin,
  },
] as const;
