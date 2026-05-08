// Utility function to clean up abandoned Buy Now carts
exports.cleanupBuyNowCarts = async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Find and delete abandoned buy now carts older than 1 hour
      const result = await cartService.deleteMany({
        isBuyNow: true,
        isPurchased: false,
        updatedAt: { $lt: oneHourAgo }
      });
      
      console.log(`Cleaned up ${result.deletedCount} abandoned buy now carts`);
    } catch (error) {
      console.error('Error cleaning up buy now carts:', error);
    }
  };