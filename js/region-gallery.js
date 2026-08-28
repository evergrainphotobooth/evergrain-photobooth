(function () {
  const mount = document.querySelector("[data-region-gallery]");
  if (!mount) return;

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const PREFIX = "images/gallery/";

  var thumb = function (name, w, h) {
    return SUPABASE_URL + "/storage/v1/render/image/public/" + BUCKET + "/" + PREFIX + encodeURIComponent(name) + "?width=" + w + "&height=" + h + "&resize=cover&quality=76";
  };

  var label = function (name) {
    return name.replace(/^\d+x\d+_/i, "").replace(/_\d+\.[^.]+$/, "").replace(/_/g, " ").trim();
  };

  var parse = function (name) {
    var m = name.match(/^(\d+x\d+)_.*?_(\d+)\.[^.]+$/i);
    return m ? { name: name, fmt: m[1].toLowerCase(), index: Number(m[2]) } : null;
  };

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  async function listFiles() {
    var res = await fetch(SUPABASE_URL + "/storage/v1/object/list/" + BUCKET, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: PREFIX, limit: 1000, sortBy: { column: "name", order: "asc" } }),
    });
    if (!res.ok) throw new Error("Gallery list failed: " + res.status);
    return (await res.json())
      .filter(function (o) { return o && o.id && /\.(jpe?g|png|webp|avif)$/i.test(o.name); })
      .map(function (o) { return o.name; });
  }

  function sizeClass(fmt) {
    if (fmt === "2x6") return "region-gallery__item--2x6";
    if (fmt === "4x6") return "region-gallery__item--4x6";
    return "region-gallery__item--6x4";
  }

  function thumbDims(fmt) {
    if (fmt === "2x6") return [280, 840];
    if (fmt === "4x6") return [440, 660];
    return [600, 400];
  }

  function buildCarousel(items) {
    var landscape = items.filter(function (it) { return it.fmt === "6x4"; });
    var others = items.filter(function (it) { return it.fmt !== "6x4"; });

    var html = '<button type="button" class="region-gallery__arrow region-gallery__arrow--prev" aria-label="Scroll left">‹</button>';
    html += '<div class="region-gallery__track">';

    var lIdx = 0;
    var oIdx = 0;
    var total = items.length;
    var placed = 0;

    while (placed < total) {
      if (lIdx + 1 < landscape.length && (oIdx >= others.length || placed % 3 === 2)) {
        var a = landscape[lIdx++];
        var b = landscape[lIdx++];
        var dimsA = thumbDims(a.fmt);
        var dimsB = thumbDims(b.fmt);
        html += '<div class="region-gallery__stack">';
        html += '<figure class="region-gallery__item ' + sizeClass(a.fmt) + '">';
        html += '<img src="' + thumb(a.name, dimsA[0], dimsA[1]) + '" alt="' + label(a.name) + '" loading="lazy" decoding="async" draggable="false" />';
        html += '</figure>';
        html += '<figure class="region-gallery__item ' + sizeClass(b.fmt) + '">';
        html += '<img src="' + thumb(b.name, dimsB[0], dimsB[1]) + '" alt="' + label(b.name) + '" loading="lazy" decoding="async" draggable="false" />';
        html += '</figure>';
        html += '</div>';
        placed += 2;
      } else if (oIdx < others.length) {
        var it = others[oIdx++];
        var dims = thumbDims(it.fmt);
        html += '<figure class="region-gallery__item ' + sizeClass(it.fmt) + '">';
        html += '<img src="' + thumb(it.name, dims[0], dims[1]) + '" alt="' + label(it.name) + '" loading="lazy" decoding="async" draggable="false" />';
        html += '</figure>';
        placed++;
      } else if (lIdx < landscape.length) {
        var solo = landscape[lIdx++];
        var soloD = thumbDims(solo.fmt);
        html += '<figure class="region-gallery__item ' + sizeClass(solo.fmt) + '">';
        html += '<img src="' + thumb(solo.name, soloD[0], soloD[1]) + '" alt="' + label(solo.name) + '" loading="lazy" decoding="async" draggable="false" />';
        html += '</figure>';
        placed++;
      } else {
        break;
      }
    }

    html += '</div>';
    html += '<button type="button" class="region-gallery__arrow region-gallery__arrow--next" aria-label="Scroll right">›</button>';
    mount.innerHTML = html;

    var track = mount.querySelector(".region-gallery__track");
    var prev = mount.querySelector(".region-gallery__arrow--prev");
    var next = mount.querySelector(".region-gallery__arrow--next");
    var step = function () { return Math.min(track.clientWidth * 0.8, 600); };
    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });

    var update = function () {
      var overflow = track.scrollWidth - track.clientWidth > 4;
      prev.disabled = !overflow || track.scrollLeft <= 1;
      next.disabled = !overflow || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    setTimeout(update, 300);
  }

  (async function () {
    var files;
    try { files = await listFiles(); } catch (e) { return; }
    var all = files.map(parse).filter(function (p) { return p; });
    shuffle(all);
    var selected = all.slice(0, 18);
    if (selected.length) buildCarousel(selected);
  })();
})();
