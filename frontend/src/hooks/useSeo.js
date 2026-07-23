import { useEffect } from "react";
import { publicApi, resolveAssetUrl } from "../lib/publicApi";

// Sets document title + meta/OG/Twitter/robots tags for the given page key
// (matches the `page` column in the backend Seo model, e.g. "home",
// "about", "projects"). No react-helmet dependency — this sandbox can't
// reliably install new packages, so tags are applied/reverted by hand.
// Falls back to sensible defaults if the admin hasn't configured SEO
// for this page yet (backend returns null in that case, by design).
function setMeta(name, content, attr = "name") {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(url) {
  if (!url) return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export default function useSeo(pageKey, fallback = {}) {
  useEffect(() => {
    let cancelled = false;
    const previousTitle = document.title;

    publicApi
      .seo(pageKey)
      .then(({ data }) => {
        if (cancelled) return;
        const seo = data?.data || {};
        const title = seo.metaTitle || fallback.title;
        const description = seo.metaDescription || fallback.description;
        const ogImage = resolveAssetUrl(seo.ogImage) || fallback.image;
        const pageUrl = seo.canonicalUrl || window.location.href;

        if (title) document.title = title;
        setMeta("description", description);
        setMeta("keywords", seo.keywords);
        setMeta("robots", seo.noIndex ? "noindex, nofollow" : "index, follow");

        setMeta("og:type", "website", "property");
        setMeta("og:url", pageUrl, "property");
        setMeta("og:title", seo.ogTitle || title, "property");
        setMeta("og:description", seo.ogDescription || description, "property");
        if (ogImage) setMeta("og:image", ogImage, "property");

        setMeta("twitter:card", seo.twitterCard || "summary_large_image");
        setMeta("twitter:title", seo.ogTitle || title);
        setMeta("twitter:description", seo.ogDescription || description);
        if (ogImage) setMeta("twitter:image", ogImage);

        setCanonical(seo.canonicalUrl || window.location.href);
      })
      .catch(() => {
        // No SEO row configured yet / request failed — keep page defaults.
        if (!cancelled) {
          if (fallback.title) document.title = fallback.title;
          setMeta("robots", "index, follow");
        }
      });

    return () => {
      cancelled = true;
      document.title = previousTitle;
    };
  }, [pageKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
