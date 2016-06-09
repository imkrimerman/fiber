'use strict';

/**
 * Fiber build structure
 * @type {Array.<string>}
 */
module.exports = [
  // Base
  './src/Core/Properties.js',
  './src/Core/Version.js',
  './src/Core/Types.js',
  './src/Core/Functions.js',
  './src/Core/Compatibility.js',
  './src/Core/Access.js',
  './src/Core/Config.js',
  // Support
  './src/Support/fn.js',
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
  './src/Foundation/Type.js',
  './src/Foundation/Log.js',
  './src/Foundation/Monitor.js',
  // Contracts
  './src/Contracts/Contract.js',
  './src/Contracts/Eventable.js',
  './src/Contracts/Serializable.js',
  './src/Contracts/Access.js',
  './src/Contracts/Access.js',
  './src/Contracts/Storage.js',
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
  './src/Extensions/Serializable.js',
  // Sync
  './src/Sync/Raw/Request.js',
  './src/Sync/Raw/Response.js',
  './src/Sync/Request.js',
  './src/Sync/Response.js',
  './src/Sync/Sync.js',
  // Mocks integration
  './src/Mocks/Interceptor.js',
  './src/Mocks/Mock.js',
  // Storage
  './src/Storage/Storage.js',
  './src/Storage/Adapter.js',
  './src/Storage/Server.js',
  './src/Storage/Local.js',
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
