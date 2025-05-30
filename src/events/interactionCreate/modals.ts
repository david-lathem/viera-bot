import {
    BaseInteraction,
    ModalSubmitInteraction,
  } from 'discord.js';
 import {items}  from "../../kits/Items.js"
  export default async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;
  
    const [type, action] = interaction.customId.split('_');
  
    switch (type) {
      case 'kitName':
        handleKitModal(interaction, action);
        break;
  
      // Add more cases for different modal types if needed
      default:
        console.warn(`Unhandled modal type: ${type}`);
    }
  };
  
 async function handleKitModal(interaction: ModalSubmitInteraction, action: string) {
    try {
    interface UserKit {
        kitName: string;
        items: any[]; // Replace `any` with your actual item type
        currentCategory: string | null;
        currentItemPage: number;
      }
      
    const userKits: Record<string, UserKit> = {};   

    const kitName = interaction.fields.getTextInputValue('kit_name');

    if (!kitName || kitName.length < 2) {
      await interaction.reply({
        content: 'Please provide a valid kit name.',
        ephemeral: true,
      });
      return;
    }

    userKits[interaction.user.id] = {
      kitName,
      items: [],
      currentCategory: null,
      currentItemPage: 0,
    };

    await interaction.deferReply({ ephemeral: true });
    await sendKitMessage(interaction, userKits[interaction.user.id], 'select_category_item');

} catch (err) {
    console.error('Error handling kit_name_modal:', err);

    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: 'An error occurred with the kit name modal.',
          ephemeral: true,
        });
      } catch {}
    }
  }
  }
  

  async function sendKitMessage(interaction : BaseInteraction, kit, step = 'main') {
    const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean) : [];
        const wearItems = safeMap(kit.items.filter(i => i.slot === 'Wear'), (i) => {
          const arr = items[i.category];
          if (!arr) return { ...i, size: 50, imgs: [], amount: i.amount };
          const itemData = arr.find(it => it.id === i.itemId);
          if (!itemData) return { ...i, size: 50, imgs: [], amount: i.amount };
          return { ...i, size: 50, imgs: [itemData.id], amount: i.amount };
        });
        const mainItems = safeMap(kit.items.filter(i => i.slot === 'Main'), (i) => {
          const arr = items[i.category];
          if (!arr) return { ...i, size: 50, imgs: [], amount: i.amount };
          const itemData = arr.find(it => it.id === i.itemId);
          if (!itemData) return { ...i, size: 50, imgs: [], amount: i.amount };
          return { ...i, size: 50, imgs: [itemData.id], amount: i.amount };
        });
        const beltItems = safeMap(kit.items.filter(i => i.slot === 'Belt'), (i) => {
          const arr = items[i.category];
          if (!arr) return { ...i, size: 50, imgs: [], amount: i.amount };
          const itemData = arr.find(it => it.id === i.itemId);
          if (!itemData) return { ...i, size: 50, imgs: [], amount: i.amount };
          return { ...i, size: 50, imgs: [itemData.id], amount: i.amount };
        });
        while (wearItems.length < 7) wearItems.push({ size: 50 });
        while (mainItems.length < 24) mainItems.push({ size: 50 });
        while (beltItems.length < 6) beltItems.push({ size: 50 });
        const slots = [
          { name: 'Wear', labelY: 40, items: wearItems },
          { name: 'Main', labelY: 180, items: mainItems },
          { name: 'Belt', labelY: 500, items: beltItems }
        ];
        const fondo = null;
  }