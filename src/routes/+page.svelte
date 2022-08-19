<script lang="ts">
  import { InventoryItem } from "$lib/InventoryItem";
  import { Notifications, NotificationType } from "$lib/Notifications";
  import { v4 } from "uuid";
  import type { SupabaseClient } from "@supabase/supabase-js";

  import { getContext, onMount } from "svelte";

  let supabase: SupabaseClient = getContext("supabase");
  let inventory: InventoryItem[] = [];
  let searchFilter = "";

  enum ShowFilterEnum {
    All = "Show All",
    Stock = "Show In Stock",
    OutOfStock = "Show Out of Stock",
  }

  let showFilter = ShowFilterEnum.All;
  let filteredInventory: InventoryItem[] = [];

  $: {
    filteredInventory = inventory;
    if (showFilter === ShowFilterEnum.Stock) {
      filteredInventory = inventory.filter((item) => !item.should_restock);
    } else if (showFilter === ShowFilterEnum.OutOfStock) {
      filteredInventory = inventory.filter((item) => item.should_restock);
    } else {
      filteredInventory = inventory;
    }
    // Filter by search filter
    filteredInventory = filteredInventory.filter((item) => {
      return (
        JSON.stringify(item)
          .toLowerCase()
          .includes(searchFilter.toLowerCase()) || searchFilter == ""
      );
    });
  }

  InventoryItem.fetch_all(supabase).then((items) => {
    inventory = items;
  });

  function createItem() {
    // Create a new item
    let item = new InventoryItem();
    item.name = "Unnamed Item " + v4();
    item.description = "";
    item.min_stock = 0;
    item.should_restock = false;
    supabase
      .from("inventory")
      .insert([item])
      .then(
        (result) => {
          // Redirect to /inventory/[id]
          if (result.data && result.data[0]) {
            let data = result.data[0] as InventoryItem;
            window.location.href = "/inventory/" + data.id;
          } else {
            Notifications.add("Error creating item", NotificationType.Error);
          }
        },
        (error) => {
          console.log(error);
          Notifications.add(error.message, NotificationType.Error);
        }
      );
  }
</script>

<div class="prose min-w-full w-full">
  <h1 class="flex-1">Inventory</h1>

  <input
    class="input input-bordered w-full"
    type="text"
    placeholder="Search"
    bind:value={searchFilter}
  />

  {#each Object.keys(ShowFilterEnum) as enumKeys}
    <label class="label cursor-pointer">
      <span class="label-text">{ShowFilterEnum[enumKeys]}</span>
      <input
        bind:group={showFilter}
        value={ShowFilterEnum[enumKeys]}
        type="radio"
        name="showFilter"
        class="radio"
      />
    </label>
  {/each}

  <!-- List with:  -->
  <!-- Name, description, status, minimum stock, actions -->
  <table class="table table-compact w-full">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th>Min Stock</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredInventory as item}
        <tr class="hover:active non-restock-row">
          <td class="whitespace-normal break-words">{item.name}</td>
          <td class="whitespace-normal break-words">
            <p>{item.description}</p>
          </td>
          <td class="text-center">{item.min_stock}</td>
          <!-- Status is a check mark set to item.status -->
          <td>
            <div class="flex  gap-4 text-center">
              {#if item.should_restock}
                <div class="tooltip" data-tip="Set as in stock">
                  <button
                    class="btn btn-error hover:btn-success"
                    on:click={() => {
                      item.should_restock = false;
                      item.sync(supabase);
                    }}
                  >
                    <i class="fas fa-cart-shopping" />
                  </button>
                </div>
              {:else}
                <div class="tooltip" data-tip="Flag to restock">
                  <button
                    class="btn btn-success hover:btn-error"
                    on:click={() => {
                      item.should_restock = true;
                      item.sync(supabase);
                    }}
                  >
                    <i class="fas fa-sync-alt" />
                  </button>
                </div>
              {/if}
              <div class="tooltip" data-tip="Edit">
                <a href="/inventory/{item.id}" class="btn">
                  <i class="fas fa-edit" />
                </a>
              </div>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<!-- Add FAB on the bottom right -->
<div class="fixed bottom-0 right-0 mb-4 mr-4">
  <button
    class="btn btn-primary"
    on:click={() => {
      createItem();
    }}
  >
    <i class="fas fa-plus" />
  </button>
</div>
