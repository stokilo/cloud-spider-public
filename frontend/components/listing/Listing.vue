<template>
  <section class="column is-half" v-if="isVisible">
    <b-carousel
      :autoplay="false"
      with-carousel-list
      :indicator="false"
      :overlay="gallery"
      :progress="true"
      icon-size="is-large"
      @click="switchGallery(true)"
    >
      <b-carousel-item>
        <figure class="image">
          <img :src="record.col1.coverFileName | cdnUrl" alt="">
        </figure>
      </b-carousel-item>

      <b-carousel-item v-for="(item, i) in record.col1.listingFileNames" :key="i">
        <figure class="image">
          <img :src="item | cdnUrl" alt="">
        </figure>
      </b-carousel-item>
      <span v-if="gallery" class="modal-close is-large" @click="switchGallery(false)"/>
      <template #list="props">
        <b-carousel-list
          v-model="props.active"
          :data="previewItems"
          v-bind="al"
          as-indicator
          @switch="props.switch($event, false)"
        />
      </template>
      <template #overlay>
        <div class="has-text-centered has-text-white">
          {{ record.col1.title }}
        </div>
      </template>
    </b-carousel>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { ListingRecord } from '@backend/listing/listing'
import cdnUrl from '~/utils/assets'

@Component
export default class Listing extends Vue {
  @Prop({ required: true }) readonly record!: ListingRecord

  gallery: boolean = false
  al: object = {
    hasGrayscale: true,
    itemsToShow: 6,
    breakpoints: {
      768: {
        hasGrayscale: false,
        itemsToShow: 6
      },
      960: {
        hasGrayscale: true,
        itemsToShow: 6
      }
    }
  }

  get previewItems () {
    if (this.record && this.record.col1 && this.record.col1.listingFileNames) {
      const images: Array<object> = this.record.col1.listingFileNames.map((e: string) => {
        return { image: cdnUrl(e) }
      })
      images.push({ image: cdnUrl(this.record.col1.coverFileName as string) })
      return images
    }

    return []
  }

  get isVisible () {
    return this.record && this.record.pk && this.record.pk.length
  }

  switchGallery (isGalleryActive: boolean) {
    this.gallery = isGalleryActive
    if (isGalleryActive) {
      document.documentElement.classList.add('is-clipped')
    } else {
      document.documentElement.classList.remove('is-clipped')
    }
  }
}
</script>
