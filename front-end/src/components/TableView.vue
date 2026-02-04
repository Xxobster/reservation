<script setup>
import ButtonAction from "@/components/ButtonAction.vue";
import CrossIcon from "~icons/radix-icons/cross-circled";
import NotFoundResource from "@/components/NotFoundResource.vue";
import reservationAPI from "@/services/reservationAPI";

const props = defineProps({
  fields: Object,
  collection: Array,
});

const emit = defineEmits([
  "onOpen",
  "onSelectedReservation",
  "onCanceledReservation",
]);

const passItemData = (item) => {
  emit("onSelectedReservation", item);
};

const openPopup = (text) => {
  emit("onOpen", {
    isOpen: true,
    headerText: text,
  });
};

const toUpperCase = (str) => {
  return str.toUpperCase();
};

const isResStatusMissed = (resStatus) => {
  return resStatus === "missed";
};

const getStatusClass = (status) => {
  switch (status) {
    case 'seated': return 'status-seated';
    case 'missed': return 'status-missed';
    case 'pending': return 'status-pending';
    default: return '';
  }
};

// Format phone number for WhatsApp URL (remove spaces, +, -, etc.)
const getWhatsAppUrl = (phone) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  return \`https://wa.me/\${cleanPhone}\`;
};

const cancelReservation = async (item) => {
  try {
    const res = await reservationAPI.cancelReservation(item.id);
    console.log(res);
    emit("onCanceledReservation");
  } catch (err) {
    console.log(err);
  }
};
</script>

<template>
  <div class="main-wrapper">
    <table key="1" v-if="props.collection.length !== 0">
      <thead>
        <tr class="header-row">
          <th v-for="field in props.fields" :key="field">
            {{ field }}
          </th>
          <th>#</th>
        </tr>
      </thead>
      <tbody>
        <tr class="body-row" v-for="item in props.collection" :key="item">
          <td v-for="(label, key) in props.fields" :key="key">
            <span v-if="key === 'phone'" class="phone-cell">
              {{ item[key] ?? "—" }}
              <a 
                v-if="item[key]"
                :href="getWhatsAppUrl(item[key])" 
                target="_blank" 
                class="whatsapp-btn"
                title="Contact via WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </span>
            <span v-else>{{ item[key] ?? "—" }}</span>
          </td>
          <td>
            <div class="actions-row">
              <span
                class="status-badge"
                :class="getStatusClass(item.resStatus)"
              >
                {{ toUpperCase(item.resStatus) }}
              </span>
              <div class="actions">
                <ButtonAction
                  v-if="item.resStatus === 'pending'"
                  text="Seat"
                  color="#22c55e"
                  @click="
                    openPopup('Choose Table');
                    passItemData(item);
                  "
                />
                <ButtonAction
                  v-if="item.resStatus !== 'missed'"
                  text="Move"
                  color="#f59e0b"
                  @click="
                    openPopup('Choose Table');
                    passItemData(item);
                  "
                />
                <ButtonAction
                  text="Delete"
                  color="#ef4444"
                  @click="cancelReservation(item)"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <NotFoundResource
      class="test"
      v-else
      text="No Reservations"
      position="relative"
    >
      <template #icon><CrossIcon class="vector" /></template>
    </NotFoundResource>
  </div>
</template>

<style scoped>
.main-wrapper {
  width: 100%;
  position: relative;
  display: grid;
}

table {
  border-collapse: separate;
  border-spacing: 0 0px;
  border: 1px solid var(--primary-black);
  border-top: 0px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  width: 100%;
}
.header-row {
  color: var(--primary-white);
  font-family: "Inter-Bold";
}
.header-row th {
  height: 40px;
  background-color: var(--primary-black);
}
.header-row th:first-of-type {
  border-top-left-radius: 10px;
}
.header-row th:last-of-type {
  border-top-right-radius: 10px;
}
.body-row {
  background-color: var(--primary-white);
  font-family: "Inter-Light";
}
.body-row td {
  text-align: center;
  padding-bottom: 10px;
  padding-top: 10px;
}
.phone-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  background-color: #25D366;
  transition: all 0.2s ease;
  text-decoration: none;
}
.whatsapp-btn:hover {
  background-color: #128C7E;
  transform: scale(1.1);
}
.whatsapp-btn svg {
  fill: white;
}
.actions-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 5px;
}
.actions {
  display: flex;
  padding-left: 10px;
  padding-right: 10px;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.status-badge {
  font-size: 11px;
  font-family: "Inter-Bold";
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}
.status-seated {
  background-color: #22c55e;
  color: white;
}
.status-missed {
  background-color: #ef4444;
  color: white;
}
.status-pending {
  background-color: #f59e0b;
  color: white;
}

.redColor {
  color: var(--primary-red);
}

.blueColor {
  color: var(--primary-blue);
}

.vector {
  font-size: 40px;
}
.item-container {
  width: 100%;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  filter: blur(5px);
}
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-out;
}

@media screen and (min-width: 1024px) {
  .status {
    font-size: 15px;
  }
}
</style>
