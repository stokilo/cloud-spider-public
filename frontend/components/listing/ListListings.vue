<template>
  <section v-if="listingStore.listingRecords.length">
    <b-table
      class="pt-2 pl-2 pr-2 pb-2"
      :data="listingStore.listingRecords"
      :narrowed="true"
      :focusable="true"
      :striped="true"
    >
      <b-table-column v-slot="props" field="title" label="Title: " width="40" centered>
        <nav class="level">
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">
                {{ props.row.col1.title }}
              </p>
              <p class="title ">
                {{ props.row.col1.area }} m2
              </p>
            </div>
          </div>
        </nav>
      </b-table-column>

      <b-table-column v-slot="props" field="price" label="Price: " width="40" centered>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Asking:</p>
            <p class="title ">
              {{ props.row.col1.price }} USD
            </p>
          </div>
        </div>
      </b-table-column>

      <b-table-column v-slot="props" field="price" label="Cover: " width="40">
        <b-image class="title is-128x128" :src="props.row.col1.coverFileName | cdnUrl" alt="" />
      </b-table-column>

      <b-table-column v-slot="props" field="edit" label=" " width="40">
        <a href="#" @click.prevent="loadListing(props.row)">Show</a>
      </b-table-column>

      <template #footer>
        <div class="has-text-right">
          User listings
        </div>
      </template>
    </b-table>

    <Listing :record="selectedListingRecord" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { ListingRecord, newListingRecord } from '@backend/listing/listing'
import { proxy } from '~/store/store'
import { $loader, $log } from '~/utils/api'
import { ListingStore } from '~/store/modules/listing/listing-store'
import Listing from '~/components/listing/Listing.vue'
import constants from '~/constants'

@Component({
  components: { Listing }
})
export default class ListListings extends Vue {
  listingStore: ListingStore = proxy.listingStore
  selectedListingRecord?: ListingRecord = newListingRecord()

  async mounted () {
    const loader = $loader.show()
    await this.listingStore.loadListings()
    loader.hide()
  }

  loadListing (listingRecord: ListingRecord) {
    this.selectedListingRecord = listingRecord
  }
}
</script>
