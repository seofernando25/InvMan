<script lang="ts">
  // CSS
  import "../app.css";
  import "@fortawesome/fontawesome-free/css/all.min.css";

  // Misc
  import { onMount } from "svelte";

  // Notifications
  import {
    Notification,
    Notifications,
    NotificationType,
  } from "$lib/Notifications";

  let _notifications: Notification[] = [];
  onMount(() => {
    Notifications.subscribe((notification) => {
      _notifications = Notifications.notifications;
      console.log(_notifications);
    });
  });

  // Supabase
  import { createClient } from "@supabase/supabase-js";
  import { setContext } from "svelte";
  const supabase = createClient(
    "https://rzijrxxzhxillqibgjfh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aWpyeHh6aHhpbGxxaWJnamZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA3OTg3ODEsImV4cCI6MTk3NjM3NDc4MX0.lGHuO67v9YT5a86zOaogzrVwgewf-X8q-IydBlNQmKg"
  );
  setContext("supabase", supabase);
</script>

<div class="wrapper">
  <slot />
</div>

<div class="toast  toast-start">
  {#each _notifications as notification (notification.id)}
    <div
      class:alert-info={notification.type == NotificationType.Info}
      class:alert-success={notification.type == NotificationType.Success}
      class:alert-warning={notification.type == NotificationType.Warning}
      class:alert-error={notification.type == NotificationType.Error}
      class="max-w-[16rem] alert  alert-"
      on:click={() => {
        Notifications.remove(notification.id);
        console.log("Removing item with id: " + notification.id);
        _notifications = Notifications.notifications;
      }}
    >
      <div>
        <span>{notification.message}</span>
      </div>
    </div>
  {/each}
</div>
