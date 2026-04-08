const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* modal removed: project tiles now link to separate pages */


const skills = [
  "ArcGIS",
  "Community Engagement",
  "Python / MatLab / Fortran",
  "Ecosystem Service Modeling",
  "HPC",
  "Batch Scripting",
  "QGIS",
  "Scientific Writing",
  //"SQL",
  "Data Storytelling",
  "Rasterio / GeoPandas",
  "NaturaL Capital InVEST"
];

const techTrack = document.getElementById("techTrack");
if (techTrack) {
  const loopedSkills = [...skills, ...skills];
  techTrack.innerHTML = loopedSkills
    .map((skill) => `<span class="tech-pill">${skill}</span>`)
    .join("");
}

// Project tiles now link to separate pages; no in-page detail handling required.

const co2Toggle = document.getElementById("co2Toggle");
const co2Popover = document.getElementById("co2Popover");
const co2Value = document.getElementById("co2Value");
const co2Date = document.getElementById("co2Date");

if (co2Toggle && co2Popover && co2Value) {
  let hasLoaded = false;

  const closePopover = () => {
    co2Popover.hidden = true;
    co2Toggle.setAttribute("aria-expanded", "false");
  };

  const loadCo2Ppm = async () => {
    try {
      const response = await fetch(
        "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.csv",
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("CO2 source request failed");
      }

      const csv = await response.text();
      const rows = csv
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

      const latestRow = [...rows]
        .reverse()
        .map((row) => row.split(",").map((cell) => cell.trim()))
        .find((cells) => cells.length >= 5 && Number(cells[4]) > 0);

      if (!latestRow) {
        throw new Error("No valid CO2 data");
      }

      const [year, month, day, , ppm] = latestRow;
      const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
      const formattedDate = Number.isNaN(date.getTime())
        ? `${year}-${month}-${day}`
        : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

      co2Value.textContent = `${Number(ppm).toFixed(2)} ppm`;
      if (co2Date) {
        co2Date.textContent = `- ${formattedDate}`;
      }
    } catch (_error) {
      co2Value.textContent = "Unavailable right now";
      if (co2Date) {
        co2Date.textContent = "";
      }
      hasLoaded = false;
    }
  };

  co2Toggle.addEventListener("click", () => {
    const willOpen = co2Popover.hidden;
    co2Popover.hidden = !co2Popover.hidden;
    co2Toggle.setAttribute("aria-expanded", String(willOpen));

    if (willOpen && !hasLoaded) {
      co2Value.textContent = "Loading...";
      if (co2Date) {
        co2Date.textContent = "";
      }
      hasLoaded = true;
      loadCo2Ppm();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !co2Popover.hidden &&
      !co2Popover.contains(event.target) &&
      !co2Toggle.contains(event.target)
    ) {
      closePopover();
    }
  });
}
