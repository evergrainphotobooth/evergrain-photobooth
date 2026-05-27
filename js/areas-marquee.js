/* =========================================================
   Evergrain Photobooth — Areas Marquee
   Injects an infinite-scroll marquee above the footer.
   Renders into <div data-marquee-placeholder></div> on every page.
   Uses root-relative URLs so links work from any depth.
   ========================================================= */

(function () {
  const placeholder = document.querySelector("[data-marquee-placeholder]");
  if (!placeholder) return;

  // Master list — keep in sync with data/areas.json
  const REGIONS = [
    { slug: "central-los-angeles", name: "Central LA", neighborhoods: ["hollywood","los-feliz","silver-lake","echo-park","koreatown","downtown-los-angeles","westlake","little-tokyo","arts-district","chinatown","mid-wilshire","larchmont","hancock-park","thai-town","little-armenia","virgil-village"] },
    { slug: "westside-los-angeles", name: "Westside LA", neighborhoods: ["santa-monica","venice","marina-del-rey","beverly-hills","west-hollywood","culver-city","century-city","brentwood","pacific-palisades","playa-vista","westwood","sawtelle"] },
    { slug: "san-fernando-valley", name: "San Fernando Valley", neighborhoods: ["studio-city","north-hollywood","sherman-oaks","encino","tarzana","woodland-hills","reseda","van-nuys","panorama-city","porter-ranch","burbank","glendale","san-fernando","calabasas"] },
    { slug: "san-gabriel-valley", name: "San Gabriel Valley", neighborhoods: ["pasadena","arcadia","monrovia","alhambra","san-gabriel","monterey-park","rosemead","temple-city","el-monte","west-covina","covina","glendora","azusa","san-dimas","la-verne","rowland-heights","hacienda-heights","diamond-bar","claremont"] },
    { slug: "southeast-los-angeles", name: "Southeast LA", neighborhoods: ["downey","whittier","norwalk","cerritos","lakewood","bellflower","pico-rivera","montebello","paramount"] },
    { slug: "south-bay", name: "South Bay", neighborhoods: ["long-beach","manhattan-beach","hermosa-beach","redondo-beach","torrance","el-segundo","palos-verdes-estates","san-pedro"] },
    { slug: "orange-county", name: "Orange County", neighborhoods: ["anaheim","irvine","santa-ana","fullerton","orange","costa-mesa","huntington-beach","newport-beach","garden-grove","brea","yorba-linda","tustin"] },
    { slug: "ventura-county-edge", name: "Ventura County Edge", neighborhoods: ["thousand-oaks","agoura-hills","westlake-village","simi-valley"] }
  ];

  const toTitle = (slug) => slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ").replace(/\bLa\b/g, "LA");

  // Build one full set of links (region label + neighborhoods), then duplicate for seamless loop.
  const items = [];
  REGIONS.forEach(r => {
    items.push(`<a class="areas-marquee__item areas-marquee__item--region" href="/areas-we-serve/${r.slug}">${r.name}</a>`);
    r.neighborhoods.forEach(n => {
      items.push(`<a class="areas-marquee__item" href="/areas-we-serve/${r.slug}/${n}">${toTitle(n)}</a>`);
    });
  });
  const oneSet = items.join("");

  placeholder.outerHTML = `
<section class="areas-marquee" aria-label="Areas we serve">
  <span class="areas-marquee__label">Areas We Serve</span>
  <div class="areas-marquee__track" aria-hidden="false">
    ${oneSet}${oneSet}
  </div>
</section>`;
})();
