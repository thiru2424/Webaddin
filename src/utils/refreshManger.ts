// Holds all refresh callbacks
const refreshRegistry: (() => void | Promise<void>)[] = [];

export function registerRefresh(callback: () => void | Promise<void>) {
  console.log("📌 Registered a new refresh callback.");
  refreshRegistry.push(callback);
}

export async function refreshData() {
  console.log("🔁 Refreshing all registered modules...");

  for (const [index, callback] of refreshRegistry.entries()) {
    try {
      console.log(`🔹 Running refresh callback #${index + 1}`);
      await callback();
      console.log(`✅ Callback #${index + 1} completed.`);
    } catch (error) {
      console.error(`❌ Callback #${index + 1} failed:`, error);
    }
  }

  console.log("✅ All refresh operations complete.");
}
