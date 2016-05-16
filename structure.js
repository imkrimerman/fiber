'use strict';

/**
 * Fiber build structure
 * @type {Array.<string>}
 */
module.exports = [
  // Base
  './src/Base/Properties.js',
  './src/Base/Version.js',
  './src/Base/Functions.js',
  './src/Base/Compatibility.js',
  './src/Base/Storage.js',
  './src/Base/Config.js',
  // Support
  './src/Support/fn.js',
  './src/Support/Macros.js',
  './src/Support/Descriptor.js',
  './src/Support/DeepProps.js',
  './src/Support/Class.js',
  './src/Support/RegExp.js',
  './src/Support/Injection.js',
  './src/Support/Validation.js',
  './src/Support/Template.js',
  './src/Support/Computed.js',
  './src/Support/Compose.js',
  './src/Support/Extensions.js',
  './src/Support/Cast.js',
  './src/Support/Types.js',
  './src/Support/Serialize.js',
  // Base tools
  './src/Foundation/Methods.js',
  './src/Foundation/Events.js',
  './src/Foundation/BaseClass.js',
  './src/Foundation/Log.js',
  './src/Foundation/Monitor.js',
  './src/Foundation/Type.js',
  // Contracts
  './src/Contracts/Contract.js',
  './src/Contracts/Access.js',
  './src/Contracts/Eventable.js',
  './src/Contracts/Releasable.js',
  './src/Contracts/Serializable.js',
  './src/Contracts/RepositoryAdapter.js',
  // Base Classes
  './src/Foundation/Class.js',
  './src/Foundation/Bag.js',
  './src/Foundation/ErrorBag.js',
  './src/Foundation/Queue.js',
  './src/Foundation/Promise.js',
  './src/Foundation/Extension.js',
  // Inversion of control Container
  './src/Container.js',
  // Extensions
  './src/Extensions/Events.js',
  './src/Extensions/Access.js',
  './src/Extensions/Binder.js',
  './src/Extensions/Extend.js',
  './src/Extensions/Extensions.js',
  './src/Extensions/OwnProps.js',
  './src/Extensions/Serialize.js',
  // Sync
  './src/Sync/Sync.js',
  './src/Sync/Request.js',
  './src/Sync/Response.js',
  // Mocks integration
  './src/Mocks/Transmitter.js',
  // Repository
  './src/Repository/Repository.js',
  './src/Repository/Adapter.js',
  './src/Repository/Server.js',
  './src/Repository/Local.js',
  // Base component classes
  './src/Foundation/Model.js',
  './src/Foundation/Collection.js',
  './src/Foundation/Collections/LinkedViews.js',
  './src/Foundation/Collections/Listeners.js',
  // Command bus
  './src/Commands/Registry.js',
  './src/Commands/Command.js',
  './src/Commands/Handler.js',
  './src/Commands/Hub.js',
  // Fiber components
  './src/Object.js',
  './src/Model.js',
  './src/Collection.js',
  './src/Views.js',
  './src/View.js',
  './src/CollectionView.js',
  './src/Layout.js',
  // Routing
  './src/Routing/RouterCollection.js',
  './src/Routing/HistoryItem.js',
  './src/Routing/HistoryCollection.js',
  './src/Routing/Route.js',
  './src/Routing/Routes.js',
  './src/Routing/Middleware.js',
  './src/Routing/MiddlewareCollection.js',
  './src/Routing/Router.js',
  // Application
  './src/Viewport.js',
  './src/Application.js',
];
