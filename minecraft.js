export function showMinecraftView(container) {
    fetch('minecraft.html')
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
        });
}