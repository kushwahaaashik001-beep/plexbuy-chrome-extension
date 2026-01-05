// content.js

// 1. Configuration (Aapke diye hue details)
// API call is https://plexbuy-final-fix.vercel.app/api/analyze-product
const PLEXBUY_API_BASE_URL = "https://plexbuy-final-fix.vercel.app/api"; 
const AMAZON_AFFILIATE_ID = "plexbuyai24-21"; 
const FONT_AWESOME_CSS = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";


// Function to ensure Font Awesome (for icons) is loaded
function loadFontAwesome() {
    if (!document.querySelector(`link[href="${FONT_AWESOME_CSS}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_AWESOME_CSS;
        document.head.appendChild(link);
    }
}

// Function to extract product name and determine the current platform
function extractProductNameAndPlatform() {
    const url = window.location.href;
    let productName = null;
    let platform = null;

    if (url.includes('amazon.in') && url.includes('/dp/')) {
        productName = document.getElementById('productTitle')?.textContent.trim();
        platform = 'amazon';
    } else if (url.includes('flipkart.com') && url.includes('/p/')) {
        // Flipkart Product Page Detection (Common selector)
        productName = document.querySelector('h1.B_NuCI')?.textContent.trim();
        platform = 'flipkart';
    }
    
    if (productName && productName.length > 20) {
        return { productName, platform, productUrl: url };
    }
    return { productName: null, platform: null, productUrl: null };
}

// Function to inject or update the UI popup
function injectPopup(productName, contentHtml, isFinal = false) {
    let box = document.getElementById('plexbuy-ai-box-id');
    
    // Agar box pehle se nahi hai toh naya banao
    if (!box) {
        box = document.createElement('div');
        box.id = 'plexbuy-ai-box-id';
        box.className = 'plexbuy-ai-box';
        
        // Always append to body and rely on CSS fixed positioning
        document.body.appendChild(box);
    }
    
    // Update the content of the box
    box.innerHTML = `
        <h4><i class="fas fa-robot"></i> PlexBuy AI Analysis: ${productName.substring(0, 40)}...</h4>
        ${contentHtml}
    `;

    // Adjust class for final look
    if(isFinal) {
        box.classList.remove('plexbuy-loading-state');
        box.classList.add('plexbuy-final-state');
    } else {
        box.classList.add('plexbuy-loading-state');
        box.classList.remove('plexbuy-final-state');
    }
}


// Main Analysis Function
async function startAnalysis() {
    loadFontAwesome(); // Load icons needed for the box

    const productInfo = extractProductNameAndPlatform();
    
    if (!productInfo.productName || !productInfo.platform) {
        return; // Exit if not on a product page
    }
    
    const { productName, productUrl, platform } = productInfo;

    // Step 1: Inject Loading State
    const loadingContent = `<p class="plexbuy-loading"><i class="fas fa-spinner fa-spin"></i> Finding the best deal for you...</p>`;
    injectPopup(productName, loadingContent, false);

    try {
        // API call to your Vercel backend
        const response = await fetch(`${PLEXBUY_API_BASE_URL}/analyze-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: `Analyse this product for me in Hindi/Hinglish: ${productName}`,
                product_url: productUrl,
                platform: platform 
            })
        });

        const data = await response.json();
        
        // Handle no response or error from AI
        if (!data.ai_summary || !data.affiliate_link) {
             const errorContent = `<p class="plexbuy-error"><i class="fas fa-exclamation-triangle"></i> AI analysis failed. Please try again later.</p>`;
             injectPopup(productName, errorContent, true);
             return;
        }

        // Add Amazon Affiliate ID to the link
        let finalLink = data.affiliate_link;
        if (platform === 'amazon' && finalLink.includes('amazon.in')) {
            // Add or update the Amazon affiliate tag
            finalLink = finalLink.includes('?') ? finalLink + `&tag=${AMAZON_AFFILIATE_ID}` : finalLink + `?tag=${AMAZON_AFFILIATE_ID}`;
        }
        
        // Step 2: Update UI with final data
        const finalContentHtml = `
            <p>${data.ai_summary}</p>
            <a href="${finalLink}" target="_blank" class="plexbuy-cta">
                <i class="fas fa-shopping-cart"></i> ₹ Best Deal via PlexBuy
            </a>
            <p class="plexbuy-note">Detailed report, comparisons, aur reviews ke liye click karein.</p>
        `;

        injectPopup(productName, finalContentHtml, true);

    } catch (error) {
        console.error("AI Analysis/Network Failed:", error);
        const errorContent = `<p class="plexbuy-error"><i class="fas fa-network-wired"></i> Connection error. Check backend status.</p>`;
        injectPopup(productName, errorContent, true);
    }
}

// Start analysis after a short delay
window.onload = function() {
    setTimeout(startAnalysis, 2500); 
};
