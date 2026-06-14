export async function shareProduct(product:any){

    const shareMessages = [
        "Just found this beauty 💎✨ Check out {productName} on TheJwel – obsessed!",
        
        "This {productName} is everything 🔗 TheJwel has me hooked",
        
        "The way this piece hits different 🌿💛 {productName} – TheJwel",
        
        "Can we talk about this? {productName} from TheJwel is giving main character energy",
        
        "Found my new obsession 💚 This {productName} on TheJwel is *chef's kiss*"
      ];


      const closingLines = [
        "✨ Shop Now & Own Your Moment",
        "💎 Limited Pieces, Timeless Style",
        "🛍️ Discover More at TheJwel",
        "💚 Your Style. Your Story. TheJwel.",
        "🌟 Express Yourself – Shop TheJwel"
    ];

      const randomClosingLine = closingLines[Math.floor(Math.random() * closingLines.length)];


      const randomMessage = shareMessages[Math.floor(Math.random() * shareMessages.length)];
      const shareText = randomMessage.replace("{productName}", product.product_name);
        const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/product/${product.product_id}`;
        const shareData = {
            title: product.product_name,
            text: `${shareText} | ${randomClosingLine}`,
            url: shareUrl,
          };
          try {
            // Native share supported
            if (navigator.share) {
              // Optional support check
              if (
                navigator.canShare &&
                !navigator.canShare({
                  title: shareData.title,
                  text: shareData.text,
                  url: shareData.url,
                })
              ) {
                throw new Error("Share data not supported");
              }
        
              await navigator.share(shareData);
            } else {
              // Fallback to URL copy
              await navigator.clipboard.writeText(shareUrl);
            }
            return {success: true, error: null};
        } catch (error) {
            console.error("Error sharing product:", error);
            return {success: false, error: error as string};
        }
    }