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
    , id: 'type_col'
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

  var editWindow = genericWindowFactory(
    { width: 550
    , height: 200
    , fieldSet : fieldSet
    , route: 'bugs'
  )

  return editWindow
} }
