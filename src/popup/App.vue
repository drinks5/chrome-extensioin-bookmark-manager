<template>
  <v-app>
    <v-main>
      <v-container fluid>
        Title
        <v-text-field v-model="tab.title" required></v-text-field>

        Url
        <v-text-field v-model="tab.url" required></v-text-field>

        Tags
        <v-combobox
          v-model="tags"
          :loading="loadingQuery"
          :items="tagItems"
          :search-input.sync="search"
          v-on:blur="tagBlur"
          cache-items
          multiple
          autofocus
          persistent-hint
          hide-selected
          small-chips
        ></v-combobox>

        <v-btn :disabled="!tags" class="mr-4" @click="save">Save</v-btn>

        <v-btn @click="remove">Remove</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { getBestMatchTags } from '../utils'
import { handleTags, getBookmarks } from '../utils/bookmark'

export default {
  name: 'BookMarkManager',
  data() {
    return {
      rootBookmark: {},
      tab: { url: '', title: '' },
      originTags: [],
      tags: [],
      tag: '',
      search: '',
      tagItems: [],
      tagGroups: [],
      tagMap: new Map(),
      loadingQuery: false,
    }
  },
  created() {
    this.initBookmark()
    this.getBookmarks()
  },
  watch: {
    search(val) {
      val && val !== this.select && this.querySelections(val)
    },
  },
  methods: {
    initBookmark() {
      let that = this
      chrome.bookmarks.search('Bookmark', function (nodes) {
        let items = nodes.filter((x) => !x.url)
        if (items.length) {
          that.rootBookmark = items[0]
        } else {
          chrome.bookmarks.create(
            {
              parentId: '1',
              index: 1,
              title: 'Bookmark',
            },
            function (node) {
              that.rootBookmark = node
            }
          )
        }
      })
    },
    getBookmarks() {
      let that = this
      chrome.bookmarks.getTree(function (nodes) {
        let { bookmarkMap, tagMap } = getBookmarks(nodes)
        that.tagMap = tagMap
        that.tagGroups = [...tagMap.keys()]
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          const tab = tabs[0]
          that.tab = tab || { url: '', title: '' }
          if (!tab) {
            return
          }
          if (bookmarkMap.get(tab.url)) {
            that.tags = bookmarkMap.get(tab.url).tags.map((tag) => {
              return tag.parentTitle
            })
            that.originTags = that.tags
          }
          if (!that.tags.length) {
            that.tags = getBestMatchTags(tab.url, tab.title, that.tagGroups)
          }
        })
      })
    },
    querySelections(v) {
      this.loadingQuery = true
      this.tagItems = this.tagGroups.filter((e) => {
        return (e || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1
      })
      this.loadingQuery = false
    },
    tagBlur() {},
    save() {
      handleTags(
        this.tab,
        this.tags,
        this.originTags,
        this.tagMap,
        this.rootBookmark
      )
      window.close()
    },
    remove() {
      this.tags = []
      this.save()
    },
  },
}
</script>

<style lang="stylus"></style>
