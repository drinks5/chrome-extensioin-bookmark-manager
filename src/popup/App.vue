<template>
  <v-app>
    <v-main>
      <v-container fluid>
        Title
        <v-text-field v-model="title" required></v-text-field>

        Url
        <v-text-field v-model="url" required></v-text-field>

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
import { getBookmarks } from '../background'
import { getBestMatchTags } from '../utils'

export default {
  name: 'BookMarkManager',
  data() {
    return {
      bookmark: {},
      bookmarks: new Map(),
      title: '',
      url: '',
      originUrl: '',
      originTitle: '',
      originTags: [],
      tags: [],
      tag: '',
      search: '',
      tagItems: [],
      tagGroups: [],
      tagMaps: new Map(),
      loadingBookmarks: false,
      loadingQuery: false,
      variable: 'null',
    }
  },
  created() {
    this.getBookmarks()
    this.getBookmark()
  },
  mounted() {},
  watch: {
    search(val) {
      val && val !== this.select && this.querySelections(val)
    },
    loadingBookmarks(val) {
      let that = this
      if (this.bookmarks.get(this.url)) {
        this.tags = this.bookmarks.get(this.url).tags
      }
      if (!this.tags.length) {
        this.tags = getBestMatchTags(this.url, this.title, this.tagGroups)
      }
    },
  },
  methods: {
    getBookmark() {
      let that = this
      chrome.bookmarks.search('Bookmark', function (nodes) {
        let items = nodes.filter((x) => !x.url)
        if (items.length) {
          that.bookmark = items[0]
        } else {
          chrome.bookmarks.create(
            {
              parentId: '1',
              index: 1,
              title: 'Bookmark',
            },
            function (node) {
              that.bookmark = node
            }
          )
        }
      })
    },
    getBookmarks() {
      let that = this
      this.loadingBookmarks = true
      chrome.bookmarks.getTree(function (node) {
        let result = getBookmarks(node)
        that.tagMaps = result.tagMap
        that.tagGroups = [...result.tagMap.keys()]
        that.bookmarks = result.bookmarkMap
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          const tab = tabs[0]
          if (tab) {
            that.originUrl = that.url = tab.url
            that.originTitle = that.title = tab.title
          }
          that.loadingBookmarks = false
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
      this.getChildrenTag()
    },
    remove() {
      this.getChildrenTag()
    },
    createParentBookmarks(tagValue) {
      // 新建标签目录和标签
      let that = this;
      chrome.bookmarks.create(
        {
          parentId: that.bookmark.id,
          title: tagValue,
        },
        (node) => {
          chrome.bookmarks.create(
            {
              parentId: node.id,
              url: this.url,
              title: this.title,
            },
            (node) => node
          )
        }
      )
    },
    updateBookmark(tag) {
      // 如果存在书签
      let that = this
      chrome.bookmarks.search(that.url, (node) => {
        node = node[0]
        chrome.bookmarks.update(
          node.id,
          {
            url: that.url,
            title: that.title,
          },
          (node) => node
        )
      })
    },
    createBookmark(tag) {
      let that = this
      chrome.bookmarks.create(
        {
          parentId: tag.id,
          url: that.url,
          title: that.title,
        },
        (node) => node
      )
    },
    deleteBookmarks() {

    },
    getChildrenTag() {
      let tag,
        tagId,
        that = this
      this.tags.map((tagValue) => {
        if (!that.tagMaps.has(tagValue)) {
          return that.createParentBookmarks()
        }
        if (that.originTags.indexOf(tagValue) < 0) {
          return that.deleteBookmarks()
        }
        tagId = that.tagMaps.get(tagValue).id
        chrome.bookmarks.get(tagId, function (tag) {
          tag = tag[0]
          if (that.originTags.indexOf(tag.title)) {
            that.updateBookmark(tag)
          } else {
            that.createBookmark(tag)
          }
        })
      })
    },
  },
}
</script>

<style lang="stylus"></style>
