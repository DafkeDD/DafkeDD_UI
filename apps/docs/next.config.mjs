import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@dafke/ui"],
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  webpack: (config) => {
    // De plugin van next-intl laadt zijn codec met een dynamische import
    // (dist/esm/production/extractor/format). Webpack kan die niet statisch volgen
    // en herhaalt die melding bij elke compilatie. Het raakt de build niet, dus we
    // zetten alleen de infrastructuurlogging op "error". Fouten en waarschuwingen
    // uit je eigen code blijven gewoon zichtbaar.
    config.infrastructureLogging = { ...config.infrastructureLogging, level: "error" };
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
