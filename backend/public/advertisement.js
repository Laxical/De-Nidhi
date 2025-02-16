(async function () {
    async function getUserAddress() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                return accounts[0];
            } catch (error) {
                console.error("User denied MetaMask request", error);
                return null;
            }
        } else {
            console.error("MetaMask is not installed");
            return null;
        }
    }

    const scriptTag = document.currentScript;
    const adImageUrl = scriptTag.getAttribute("data-ad-image");
    const adWidth = scriptTag.getAttribute("data-ad-width") || "300px";
    const adHeight = scriptTag.getAttribute("data-ad-height") || "250px";
    const companyName = scriptTag.getAttribute("data-ad-id");
    const redirectUrl = scriptTag.getAttribute("redirect-url");
    const imageUrl = scriptTag.getAttribute("image-url");
    const product = scriptTag.getAttribute("product");
    const websiteAddress = scriptTag.getAttribute("website-wallet-address");

    let adContainer = document.createElement("div");
    adContainer.style.display = "flex";
    adContainer.style.alignItems = "center";
    adContainer.style.justifyContent = "center";
    adContainer.style.width = adWidth;
    adContainer.style.height = adHeight;
    adContainer.style.border = "1px solid #ccc";
    adContainer.style.cursor = "pointer";
    adContainer.innerHTML = `<img src="${adImageUrl}" width="${adWidth}" height="${adHeight}" />`;

    scriptTag.parentNode.insertBefore(adContainer, scriptTag);

    adContainer.addEventListener("click", async function () {

        window.open(`${redirectUrl}`, "_blank");

        const userAddress = await getUserAddress();
        if (!userAddress) {
            console.log("User address not available");
            return;
        }

        fetch(`https://publicite-backend.vercel.app/api/track-click`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userAddress, companyName, redirectUrl, product, websiteAddress })
        }).then(response => response.json())
          .then(data => console.log("Click Tracked", data))
          .catch(error => console.error("Error tracking click:", error));
    });
})();
