"use strict";

const STORAGE_KEY = "chmiRadarClassicEnabled";
const checkbox = document.getElementById("classic-enabled");
const status = document.getElementById("status");

function renderStatus(enabled) {
  const message = enabled
    ? "Klasický vzhled je zapnutý."
    : "Zobrazuje se současný vzhled ČHMÚ.";
  status.textContent = `${message} Verze ${chrome.runtime.getManifest().version_name}.`;
}

chrome.storage.sync.get({ [STORAGE_KEY]: true }, (result) => {
  checkbox.checked = result[STORAGE_KEY];
  renderStatus(checkbox.checked);
});

checkbox.addEventListener("change", () => {
  const enabled = checkbox.checked;
  chrome.storage.sync.set({ [STORAGE_KEY]: enabled }, () => renderStatus(enabled));
});
