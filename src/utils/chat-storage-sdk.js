export class ChatStorageSDK {
    constructor(baseURL) {
      this.baseURL = baseURL.replace(/\/$/, ""); // remove trailing slash
    }
  
    // -------------------------
    // GET /conversations
    // -------------------------
    async listConversations() {
      const res = await fetch(`${this.baseURL}/conversations`);
      if (!res.ok) throw new Error("Failed to list conversations");
      return res.json();
    }
  
    // -------------------------
    // POST /conversation
    // -------------------------
    async createConversation() {
      const res = await fetch(`${this.baseURL}/conversation`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json(); // contains { id, title, updated }
    }
  
    // -------------------------
    // GET /conversation/:id
    // -------------------------
    async getConversation(id) {
      const res = await fetch(`${this.baseURL}/conversation/${id}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      return res.json(); // returns the stored messages
    }
  
    // -------------------------
    // POST /conversation/:id
    // Add message
    // -------------------------
    async addMessage(id, role, text) {
      const res = await fetch(`${this.baseURL}/conversation/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, text }),
      });
  
      if (!res.ok) throw new Error("Failed to add message");
      return res.json();
    }
  
    // -------------------------
    // DELETE /conversation/:id
    // -------------------------
    async deleteConversation(id) {
      const res = await fetch(`${this.baseURL}/conversation/${id}`, {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Failed to delete conversation");
      return res.json(); // { ok: true, deleted: "all" }
    }
  }
  