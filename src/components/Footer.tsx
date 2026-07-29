import { motion } from "framer-motion";
import { Heart, MessageCircle, Camera, Code2, Briefcase } from "lucide-react";

const footerLinks = {
  Produtos: [
    { name: "Smartphones", href: "#" },
    { name: "Computadores", href: "#" },
    { name: "Áudio", href: "#" },
    { name: "Games", href: "#" },
  ],
  Empresa: [
    { name: "Sobre Nós", href: "#" },
    { name: "Carreiras", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Imprensa", href: "#" },
  ],
  Suporte: [
    { name: "Central de Ajuda", href: "#" },
    { name: "Termos de Uso", href: "#" },
    { name: "Privacidade", href: "#" },
    { name: "Contato", href: "#" },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: Code2, href: "#", label: "GitHub" },
  { icon: Briefcase, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer id="sobre" className="relative border-t border-border/50 scroll-mt-20">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-orange-500/3 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="Satoshi Store"
                className="h-8 w-auto rounded-lg object-contain"
              />
              <span className="text-lg font-semibold">
                Satoshi <span className="text-orange-500">Store</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm mb-6">
              O marketplace mais inovador para encontrar produtos exclusivos.
              Conectamos você aos melhores criadores e makers do Brasil.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-xl glass card-shine flex items-center justify-center text-text-tertiary hover:text-orange-500 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon size={16} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], sectionIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-sm font-medium text-text-primary mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-orange-500 transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-text-tertiary">
            &copy; {new Date().getFullYear()} Satoshi Store. Todos os direitos reservados.
          </p>
          <p className="text-sm text-text-tertiary flex items-center gap-1">
            Feito com <Heart size={14} className="text-red-400 fill-red-400" /> no Brasil
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
