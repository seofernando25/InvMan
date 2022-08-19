<script lang="ts">
  import { page } from "$app/stores";
  import { InventoryItem } from "$lib/InventoryItem";
  import { Notifications, NotificationType } from "$lib/Notifications";
  import type { SupabaseClient } from "@supabase/supabase-js";
  import { getContext, onMount } from "svelte";

  let supabase: SupabaseClient = getContext("supabase");
  let item: InventoryItem | undefined = undefined;
  let itemId = $page.params.id;
  let invalidItem = false;
  supabase
    .from<SupabaseClient>("inventory")
    .select()
    .eq("id", itemId)
    .single()
    .then((items) => {
      if (items.data) {
        console.log(items.data);
        let data = items.data as any;
        item = new InventoryItem();
        item.id = data.id;
        item.name = data.name;
        item.description = data.description;
        item.min_stock = data.min_stock;
        item.should_restock = data.should_restock;
      } else {
        console.log("No items found");
        invalidItem = true;
        Notifications.add("No Items found", NotificationType.Error);
      }
    });

  function deleteItem() {
    if (item) {
      // Delete item
      supabase
        .from("inventory")
        .delete()
        .eq("id", item.id)
        .then(
          (result) => {
            Notifications.add("Item deleted", NotificationType.Success);
            window.location.href = "/";
          },

          (error) => {
            Notifications.add("Error deleting item", NotificationType.Error);
            console.log(error);
          }
        );
    }
  }

  onMount(() => {
    // Bind the delete button to the deleteItem function
    document.addEventListener("keyup", (event) => {
      if (event.key === "Delete") {
        // If delete-item is focused, delete the item
        if (document.activeElement == document.getElementById("delete-item")) {
          deleteItem();
        }
        // Focus on delete-item
        document.getElementById("delete-item")?.focus();
      }
    });
  });

  function saveItem() {
    item?.sync(supabase).then(
      () => {
        Notifications.add("Item Saved", NotificationType.Success);
      },
      (error) => {
        Notifications.add("Error updating item", NotificationType.Error);
        console.log(error);
      }
    );
  }
</script>

{#if item}
  <div class="prose min-w-full w-full">
    <h1>Edit Item</h1>

    <!-- Form to edit item -->
    <form
      class="w-full"
      on:submit={(e) => {
        e.preventDefault();
        saveItem();
      }}
    >
      <!-- Dummy dubmit button -->
      <input type="submit" style="display: none;" />

      <div class="flex flex-col gap-4">
        <label for="name">Name</label>
        <input
          id="name"
          class="input input-bordered "
          type="text"
          bind:value={item.name}
        />
        <label for="description">Description</label>
        <textarea
          id="description"
          style="resize: none"
          class="textarea textarea-bordered "
          rows={5}
          bind:value={item.description}
        />
        <label for="min-stock">Minimum Stock</label>
        <input
          id="min-stock"
          class="input input-bordered"
          type="number"
          bind:value={item.min_stock}
        />
        <label for="should-restock">Should Restock</label>
        <div class="flex gap-4 align-middle">
          <label for="should-restock">No</label>
          <input
            type="checkbox"
            class="toggle"
            id="should-restock"
            bind:checked={item.should_restock}
          />
          <label for="should-restock">Yes</label>
        </div>
      </div>
    </form>
    <!-- Submit form button with save icon -->
    <div class="flex justify-end gap-4">
      <div class="tooltip" data-tip="Delete">
        <button
          id="delete-item"
          class="btn btn-square btn-error"
          on:click={(e) => {
            e.preventDefault();
            deleteItem();
          }}
        >
          <i class="fas fa-trash" />
        </button>
      </div>
      <div class="tooltip" data-tip="Save">
        <button
          class="btn btn-square btn-success"
          on:click={(e) => {
            e.preventDefault();
            if (item) {
              console.log("Item", item);
              console.log("Item updated");
              saveItem();
            }
          }}
        >
          <i class="fas fa-save" />
        </button>
      </div>
    </div>
  </div>
{/if}

{#if !item && invalidItem}
  <div class="prose min-w-full w-full">
    <h1>404 Item not found</h1>
  </div>
{:else if !item && !invalidItem}
  <div class="prose min-w-full w-full">
    <h1>Loading...</h1>
  </div>
{/if}
