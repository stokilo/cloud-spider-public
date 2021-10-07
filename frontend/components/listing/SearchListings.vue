<template>
  <section class="section ontop">
    <b-collapse class="card" animation="slide">
      <template #trigger="props">
        <div
          class="card-header"
          role="button"
          aria-controls="contentIdForA11y3"
        >
          <p class="card-header-title">
            Find your new home
          </p>
          <a class="card-header-icon">
            <b-icon
              :icon="props.open ? 'chevron-up' : 'chevron-down'"
            />
          </a>
        </div>
      </template>

      <div class="card-content">
        <ValidationObserver ref="form" v-slot="{ invalid }">
          <fieldset>
            <ValidationProvider v-slot="{ valid, failedRules }" rules="required|min:5|max:250" vid="location">
              <b-field
                label="Location"
                :type="{ 'is-danger': !valid, 'is-success': valid }"
                :message="formError(valid, failedRules)"
              >
                <b-autocomplete
                  v-model="searchStore.listingSearch.location"
                  field="location"
                  :data="searchStore.addressData"
                  placeholder="Warszawa"
                  :loading="searchStore.isFetching"
                  clearable
                  @typing="searchAddress"
                  @select="onLocationSelect"
                >
                  <template slot-scope="props">
                    <div class="media">
                      <div class="media-content">
                        {{ props.option.location }}
                        <br>
                      </div>
                    </div>
                  </template>
                </b-autocomplete>
              </b-field>
            </ValidationProvider>
          </fieldset>
        </ValidationObserver>

        <b-field/>

        <div class="columns ">
          <div class="column is-one-third">
            <div v-for="(listingType, index) in searchStore.listingTypes" :key="index">
              <b-radio-button
                v-model="searchStore.listingSearch.listingType"
                :native-value="listingType.id"
                type="is-success is-light is-outlined"
              >
                <b-icon icon="check"/>
                <span>{{ listingType.value }}</span>
              </b-radio-button>
            </div>
            <hr>

            <b-field>
              <b-input
                v-model="searchStore.listingSearch.minPrice"
                placeholder="Price from"
                type="number"
              />
            </b-field>

            <b-field>
              <b-input
                v-model="searchStore.listingSearch.maxPrice"
                placeholder="Price to"
                type="number"
              />
            </b-field>
          </div>

          <div class="column">
            <b-field>
              <div v-for="(listingTarget, index) in searchStore.listingTargets" :key="index">
                <b-radio-button
                  v-model="searchStore.listingSearch.listingTarget"
                  :native-value="listingTarget.id"
                  type="is-primary is-light is-outlined"
                >
                  {{ listingTarget.value }}
                </b-radio-button>
              </div>
            </b-field>

            <div v-for="(listingArea, index) in searchStore.listingAreas" :key="index">
              <b-radio-button
                v-model="searchStore.listingSearch.listingArea"
                :native-value="listingArea.id"
                type="is-primary is-light is-outlined"
              >
                {{ listingArea.value }}
              </b-radio-button>
            </div>
          </div>
        </div>
      </div>

      <footer class="card-footer">
        <b-button class="is-success is-light card-footer-item" @click="onSearchListing" :disabled="searchStore.isListingSearchDisabled">
          Search
        </b-button>
        <b-button class="is-info is-light card-footer-item" disabled="true">
          More Filters
        </b-button>
      </footer>
    </b-collapse>

    <div class="box" v-if="searchStore.listings.length">
      <div class="tile is-ancestor">
        <div class="tile is-vertical is-8">

          <div class="tile">
            <div class="tile is-parent is-vertical">
              <article class="tile is-child notification is-primary" v-if="searchStore.listings.length >= 1">
                <p class="title">
                  {{ searchStore.listings[0].title }}
                </p>
                <p class="subtitle">
                  {{ searchStore.listings[0].area }} m2
                </p>
                <figure class="image is-4by3">
                  <img :src="searchStore.listings[0].coverFileName | cdnUrl" alt="Property image">
                </figure>
              </article>

              <article class="tile is-child notification is-warning" v-if="searchStore.listings.length >= 2">
                <p class="title">
                  {{ searchStore.listings[1].title }}
                </p>
                <p class="subtitle">
                  {{ searchStore.listings[1].area }} m2
                </p>
                <figure class="image is-4by3">
                  <img :src="searchStore.listings[1].coverFileName | cdnUrl" alt="Property image">
                </figure>
              </article>
            </div>

            <div class="tile is-parent" v-if="searchStore.listings.length >= 3">
              <article class="tile is-child notification is-info">
                <p class="title">
                  {{ searchStore.listings[2].title }}
                </p>
                <p class="subtitle">
                  {{ searchStore.listings[2].area }} m2
                </p>
                <figure class="image is-4by3">
                  <img :src="searchStore.listings[2].coverFileName  | cdnUrl" alt="Property image">
                </figure>
                <hr/>
                <figure class="image is-4by3" v-if="searchStore.listings[2].listingFileNames">
                  <img :src="searchStore.listings[2].listingFileNames[0] | cdnUrl" alt="Property image">
                </figure>
              </article>
            </div>
          </div>


          <div class="tile is-parent" v-if="searchStore.listings.length >= 4">
            <article class="tile is-child notification is-danger">
              <p class="title">
                {{ searchStore.listings[3].title }}
              </p>
              <p class="subtitle">
                {{ searchStore.listings[3].area }} m2
              </p>
              <figure class="image is-4by3">
                <img :src="searchStore.listings[3].coverFileName | cdnUrl" alt="Property image">
              </figure>
            </article>
          </div>
        </div>
        <div class="tile is-parent" v-if="searchStore.listings.length >= 5">
          <article class="tile is-child notification is-success">
            <div class="content">
              <p class="title">
                {{ searchStore.listings[4].title }}
              </p>
              <p class="subtitle">
                {{ searchStore.listings[4].area }} m2
              </p>
              <figure class="image is-4by3">
                <img :src="searchStore.listings[4].coverFileName | cdnUrl" alt="Property image">
              </figure>
              <hr/>
              <figure class="image is-4by3" v-if="searchStore.listings[4].listingFileNames">
                <img :src="searchStore.listings[4].listingFileNames[0] | cdnUrl" alt="Property image">
              </figure>
              <hr/>
              <figure class="image is-4by3" v-if="searchStore.listings[4].listingFileNames && searchStore.listings[4].listingFileNames.length >= 2">
                <img :src="searchStore.listings[4].listingFileNames[1] | cdnUrl" alt="Property image">
              </figure>
              <hr/>
              <figure class="image is-4by3" v-if="searchStore.listings[4].listingFileNames && searchStore.listings[4].listingFileNames.length >= 3">
                <img :src="searchStore.listings[4].listingFileNames[2] | cdnUrl" alt="Property image">
              </figure>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>

 </template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Debounce } from 'vue-debounce-decorator'
import { LocationSearchResult } from '@backend/listing/search'
import { proxy } from '~/store/store'
import { SearchStore } from '~/store/modules/search-store'
import { $i18n, $loader, $log, $notify } from '~/utils/api'
import constants from '~/constants'

@Component
export default class SearchListings extends Vue {
  searchStore: SearchStore = proxy.searchStore

  @Debounce(500)
  async searchAddress (name: string) {
    await this.searchStore.onSearchAddress(name)
  }

  async onSearchListing () {
    const loader = $loader.show()
    try {
      await this.searchStore.onSearchListing(this.searchStore.listingSearch)
    } catch (e) {
      $log.error(e)
      $notify('error', $i18n.t('api.error-msg-title'), $i18n.t('api.error-msg-content'))
    }
    setTimeout(() => {
      loader.hide()
    }, 400)
  }

  async onLocationSelect (selectedLocation: LocationSearchResult) {
    if (selectedLocation) {
      await this.searchStore.onLocationSelect(selectedLocation)
    }
  }
}
</script>
