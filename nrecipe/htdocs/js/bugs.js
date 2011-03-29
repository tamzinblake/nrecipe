Ext.onReady(function () {
  var body = Ext.getBody()

  var Record = Ext.data.Record.create(
    [ {name: '_id'        , sortType: notNull}
    , {name: 'name'       , sortType: notNull}
    , {name: 'type'       , sortType: notNull}
    , {name: 'description', sortType: notNull}
    , {name: 'created'    , sortType: notNull, convert: formatDate}
    ]
  )

  var store = new Ext.data.JsonStore(
    { url: '/nrecipe/bugs/list'
    , fields: Record
    , remoteSort: true
    , root: 'rows'
    , totalProperty: 'totalcount'
    , idProperty: '_id'
    , listeners: { exception: failureStore
                 }
    , sortInfo: { field: '_id'
                , direction: 'ASC'
                }
    }
  )

  store.storeLoaded = false

  var editWindow = bugWindowFactory(
    { getSelected: function () {
        return store.selectedRecord
      }
    , loadStore: loadStore
    }
  )

  var addButton = new Ext.Button(
    { text: 'New bug'
    , listeners: { click: editWindow.openAdd
                 }
    }
  )

  var editButton = new Ext.Button(
    { text: 'Edit bug'
    , disabled: true
    , listeners: { click: doEdit
                 }
    }
  )

  var deleteButton = new Ext.Button(
    { text: 'Delete'
    , disabled: true
    }
  )

  deleteButton.on('click', function () {
    if (store.selectedRecord) {
      Ext.Ajax.request(
        { url: '/nrecipe/bugs/remove'
        , success: function (response,options) {
            if (successAjax(response,options)) {
              loadStore()
            }
          }
        , failure: failureAjax
        , params: { _id: store.selectedRecord.data._id
                  }
        }
      )
    }
    clearSelection()
  } )

  var pagingItems = [ '<a href="/nrecipe">Back to menu</a>'
                    , '-'
                    , addButton
                    , '-'
                    , editButton
                    , '-'
                    , deleteButton
                    , '-'
                    , '->'
                    , '-'
                    , 'Bug tracker'
                    , '-'
                    ]

  var pagingListeners = { staterestore: function () {
                            store.setBaseParam('start',this.cursor)
                            loadStore()
                          }
                        , select: function () {
                            //handles selects from the filterCombo
                            this.cursor = 0
                          }
                        }

  var pagingBar = new Ext.StatefulPagingToolbar(
    { store: store
    , pageSize: 50
    , emptyMsg: 'no data to display'
    , displayInfo: true
    , prependButtons: true
    , stateId: 'pagingToolbarBugs'
    , stateful: true
    , listeners: pagingListeners
    , items: pagingItems
    , stateEvents: [ 'change'
                   , 'select'
                   ]
    }
  )

  var model = new Ext.grid.ColumnModel(
    { columns: [ { header   : 'Name'
                 , width    : 72
                 , dataIndex: 'name'
                 , sortable : true
                 }
               , { header   : 'Type'
                 , width    : 72
                 , dataIndex: 'type'
                 , sortable : true
                 }
               , { header   : 'Description'
                 , width    : 160
                 , dataIndex: 'description'
                 , sortable : false
                 }
               , { header   : 'Created'
                 , width    : 160
                 , dataIndex: 'created'
                 , sortable : true
                 }
               ]
    , defaults: { renderer : 'htmlEncode'
                }
    }
  )

  var gridSelectionModel = new Ext.grid.RowSelectionModel(
    { singleSelect: true
    , listeners:
        { rowdeselect: function (sm, rowIndex, r) {
            store.selectedRecord = null
            deleteButton.disable()
            editButton.disable()
          }
        , rowselect: function (sm, rowIndex, r) {
            store.selectedRecord = r
            if (store.selectedRecord) {
              deleteButton.enable()
              editButton.enable()
            }
          }
        }
    }
  )

  var grid = new Ext.grid.GridPanel(
    { store: store
    , sm: gridSelectionModel
    , cm: model
    , region: 'center'
    , stripeRows: true
    , enableHdMenu: false
    , tbar: pagingBar
    , enableColumnHide : false
    , stateful: true
    , stateId: 'bugsGridState'
    , listeners: { rowdblclick: doEdit
                 }
    , viewConfig:
        { forceFit: true
        , getRowClass: function (record, rowIndex, rp, ds) {
            return 'foo'
          }
        , templates:
            { cell: new Ext.Template
               ( '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} '
               + 'x-selectable {css}" style="{style}" '
               + 'tabIndex="0" {cellAttr}>'
               , '<div class="x-grid3-cell-inner x-grid3-col-{id}" '
               + '{attr}>{value}</div>'
               , '</td>'
               )
            }
        }
    }
  )

  loadStore()

  var viewport = new Ext.Viewport(
    { layout: 'border'
    , autoHeight: true
    , autoWidth: true
    , renderTo: body
    , items: [grid]
    }
  )

  viewport.render()

  function notNull (val) {
    return val ? val : ''
  }

  function doEdit() {
    if (store.selectedRecord) {
      editWindow.openEdit()
    }
  }

  function clearSelection () {
    if (grid) {
      grid.getSelectionModel().clearSelections()
      grid.getSelectionModel().fireEvent('rowdeselect')
    }
    store.selectedRecord = null
  }

  function loadStore () {
    store.storeLoaded = false
    store.load( { callback: function () {
                    store.storeLoaded = true
                  }
                }
              )
  }
} )

function bugWindowFactory(config){ with(config){
  Ext.QuickTips.init()
  var typeStore = new Ext.data.ArrayStore(
    { fields: ['key','value']
    , data: [ ['Bug','bug']
            , ['Feature request','feature']
            , ['Notice','notice']
            ]
    }
  )

  var typeCombo = new Ext.form.ComboBox(
    { store: typeStore
    , displayField:'key'
    , valueField:'value'
    , hiddenName: 'type'
    , typeAhead: true
    , triggerAction: 'all'
    , anchor:'100%'
    , mode: 'local'
    , forceSelection: true
    , id: 'typeCol'
    , fieldLabel: 'Type'
    }
  )

  var fieldSet = new Ext.form.FieldSet(
    { border: false
    , style: { marginTop: '10px'
             , marginBottom: '0px'
             , paddingBottom: '0px'
             }
    , layout: { type: 'form'
              , labelSeparator: ''
              }
    , defaults: { xtype: 'textfield'
                }
    , items: [ { id: '_id'
               , xtype: 'hidden'
               }
             , { id: 'name'
               , anchor: '100%'
               , fieldLabel: 'Name'
               }
             , typeCombo
             , { id: 'description'
               , xtype: 'textarea'
               , anchor: '100%'
               , fieldLabel: 'Description'
               }
             ]
    }
  )

  config = config || {}
  config.width = 500
  config.height = 200
  config.fieldSet = fieldSet
  config.route = 'bugs'

  var editWindow = genericWindowFactory(config)

  return editWindow
} }
