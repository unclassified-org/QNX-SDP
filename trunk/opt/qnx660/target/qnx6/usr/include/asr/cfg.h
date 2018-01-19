/**
 * @file cfg.h
 *
 * @brief Data types and functions for setting up module configurations
 * @details  The @c cfg.h header file contains data types and functions for building and searching
 *           a configuration tree. A configuration tree consists of configuration items. These
 *           items carry configuration values that are read from configuration files.
 *
 */

#ifndef _CFG_H_INCLUDED
#define _CFG_H_INCLUDED

#include <dlfcn.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief A configuration item
 * @details This opaque type represtents a configuration item. Configuration items are linked together to 
 *          form a configuration tree, which represents the contents of a configuration file (e.g., <tt>/etc/asr-car.cfg</tt>).
 *          Each configuration item represents a single value from the configuration file.
 */
typedef struct cfg_item cfg_item_t;

/**
 * @brief Alias for the configuration encoder
 * @details This type is an alias for the configuration encoder, @c cfg_encoder.
 */
typedef struct cfg_encoder cfg_encoder_t;

/*
 * PROTOS
 */

/**
 * @brief Create a configuration item
 * @details The @e %cfg_create() function creates a configuration item with the 
 *          specified name.
 * @param name The name to assign to the new configuration item.
 * @return A pointer to the new configuration item.
 */ 
cfg_item_t        * cfg_create(const char *name);

/**
 * @brief Copy one configuration tree into another  
 * @details The @e %cfg_clone() function copies the configuration tree specified by @e root into the 
 *          configuration tree and at the location specified by @e parent. The structure of the @e root tree is maintained in
 *          the cloning operation. 
 * @param parent A pointer to the configuration tree to add the clone to.
 * @param root A pointer to the configuration tree to copy.
 * @return A pointer to the parent configuration tree on success, or NULL on error.
 */ 
cfg_item_t        * cfg_clone(cfg_item_t *parent, cfg_item_t *root); 

/**
 * @brief Destroy an entire configuration tree  
 * @details The @e %cfg_destroy() function destroys the tree specified by @e node, which doesn't have to be the root.
 *        This function finds the root of the tree, deletes all nodes including the root, and frees the associated memory. 
 * @param node A pointer to a node in the configuration tree. This pointer must not be NULL.
 * @return Nothing. No errors are logged.
 */ 
void                cfg_destroy(cfg_item_t *node);

// item creation/destruction

/**
 * @brief Add a new node to a configuration tree  
 * @details The @e %cfg_add_item() function creates a new configuration item with the specified name (@e cname) and optional
 *          value (@e cvalue) and adds it as a child of the specified node (@e current), behind its sibling nodes. Spaces
 *          and quotes are removed from the name and value; any variable references are resolved before the new
 *          item is created.
 * @param current A pointer to the node to add the new configuration item to. If NULL, the new configuration item becomes the root of a new
 *        configuration tree.
 * @param cname The name for the new node. If NULL, the name "anon" is assigned.
 * @param cvalue The value for the new node. If NULL, an empty string is assigned.
 * @return A pointer to the new node.
 */ 
cfg_item_t        * cfg_add_item (cfg_item_t *current, const char *cname, const char *cvalue);

/**
 * @brief Create a new node from a key and add it to a configuration tree  
 * @details The @e %cfg_add_item_string() function creates a new a configuration item with the name and optional
 *         value specified by @e ckey_value. If @e ckey_value contains a '{' character, it will be removed from the
 *         assigned value. For example, the key string "mynode = special {" becomes the key "mynode" and the value "special".
 *          The new item is added as a child of the specified node (@e current), behind its sibling nodes. 
 * @param current A pointer to the node to add the new configuration item to. If NULL, the new configuration item becomes the root of a new
 *        configuration tree.
 * @param ckey_value A string consisting of the name for the new node and optionally a value. If NULL, the name "anon" is assigned,
 *        with an empty string assigned as the value.
 * @return A pointer to the new node.
 */ 
cfg_item_t * cfg_add_item_string (cfg_item_t *current, const char *ckey_value);

/**
 * @brief Insert a node in a configuration tree  
 * @details The @e %cfg_insert_item() function creates a new a configuration item with the specifed name (@e ckey) and optional
 *         value (@e cvalue). Spaces and quotes are removed from the name and the value; any variable references are
 *         resolved before the new item is created. The new item is added as a child of
 *         the specified node (@e current), in front of its sibling nodes. 
 * @param current A pointer to the node to add the new configuration item to. If NULL, the new configuration item becomes the root of a new
 *        configuration tree.
 * @param ckey The name for the new node. If NULL, the name "anon" is assigned.
 * @param cvalue The value for the new node. If NULL, an empty string is assigned.
 * @return A pointer to the new node.
 */ 
cfg_item_t 		  * cfg_insert_item (cfg_item_t *current, const char *ckey, const char *cvalue);

/**
 * @brief Insert a node in a configuration tree  
 * @details The @e %cfg_insert_raw_item() function creates a new a configuration item with the specifed name (@e ckey) and optional
 *          value (@e cvalue). Spaces and quotes are removed from the name, but the value is used as specified. The new item
 *          is added as a child of the specified node (@e current), behind its sibling nodes. 
 * @param current The node to add the new configuration item to. If NULL, the new configuration item becomes the root of a new
 *        configuration tree.
 * @param ckey The name for the new node. If NULL, the name "anon" is assigned.
 * @param cvalue The value for the new node. If NULL, an empty string is assigned.
 * @return A pointer to the new node.
 */ 
cfg_item_t 		  * cfg_insert_raw_item (cfg_item_t *current, const char *ckey, const char *cvalue);

/**
 * @brief Delete the configuration tree under a node  
 * @details The @e %cfg_clear_item() function destroys the tree rooted at @e current. It deletes all child nodes under @e current 
 *          and frees the associated memory. The @e current node is not destroyed. 
 * @param current A pointer to the configuration node. This pointer must not be NULL.
 * @return Nothing. No errors are logged.
 */ 
void                cfg_clear_item (cfg_item_t *current); 

/**
 * @brief Delete the configuration tree starting at a node
 * @details The @e %cfg_delete_item() function destroys the tree rooted at @e current. It deletes the @e current node and all child nodes
 *          under it, freeing the associated memory.
 * @param current A pointer to the configuration node. This pointer must not be NULL.
 * @return Nothing. No errors are logged.
 */ 
void                cfg_delete_item (cfg_item_t *current); 

// cfg manipulation functions

/**
 * @brief Detach an item from its current parent and attach it to another node
 * @details The @e %cfg_attach_item() function detaches the specified configuration @e item from its parent and attaches it as a child to the
 *         specified node (@e parent). If @e parent is NULL, this function is equivalent to @e cfg_detach_item(). If @e parent isn't
 *         NULL, @e tail specifies whether the child is prepended (@c 0) or appended (@c 1) to the parent's list of children.
 * @param parent A pointer to the node to attach the item to.
 * @param item A pointer to the item to attach to @e parent.
 * @param tail Specifies whether the child is prepended (@c 0) or appended (@c 1) to the parent's list of children.
 * @return A pointer to the item; NULL on error.
 */
cfg_item_t *cfg_attach_item (cfg_item_t *parent, cfg_item_t *item, int tail);

/**
 * @brief Detach an item from its current parent
 * @details The @e %cfg_attach_item() function detaches the specified configuration item (@e item) from its parent and corrects any references in 
 *          the list of siblings, if any.
 * @param item A pointer to the item to detach.
 * @return A pointer to the item.
 */
cfg_item_t *cfg_detach_item (cfg_item_t *item);

/**
 * @brief Move configuration nodes from a doner to a new parent node
 * @details The @e %cfg_merge() function removes the @e doner node's next item (along with its children) and attaches it as a child
 *          of the specified node (@e parent).
 * @param parent A pointer to the node to attach the item to.
 * @param doner A pointer to the node whose next item will be moved to the new parent.
 * @return Nothing.
 */
void cfg_merge (cfg_item_t *parent, cfg_item_t *doner);


/**
 * @brief Replace a node in a configuration tree
 * @details The @e %cfg_replace_item() function deletes the first node under @e base with the key @e ckey. It then inserts a new node
 *          with the key @e ckey and value @e new_value as a child of @e base, in front of its sibling nodes.
 * @param base A pointer to the root of the configuration tree to search.
 * @param ckey The key of the node to search for.
 * @param new_value The value of the replacement node.
 * @return A pointer to the new configuration item.
 */
cfg_item_t * cfg_replace_item (cfg_item_t *base, const char *ckey, const char *new_value);

// search base, depth first
/**
 * @brief Return the next node in a depth-first traversal of a configuration tree.
 * @details The @e %cfg_traverse() function returns subsequent items in a depth-first traversal of the configuration tree rooted at @e base.
 *          To traverse the tree, you call @e %cfg_traverse() repeatedly, each time passing the result of the previous call as @e current.
 *          @e %cfg_traverse() returns NULL if @e current is equal to @e base (i.e., @e base was returned by the last call), indicating the
 *          traversal is complete.
 * @param base A pointer to the base of the configuration tree.
 * @param current A pointer to the current node of the configuration tree.
 * @return A pointer to the next node in the traversal of the configuration tree.
 */
cfg_item_t  * cfg_traverse (const cfg_item_t *base, const cfg_item_t *current);

/**
 * @brief Return the next node in a depth-first traversal of a configuration tree.
 * @details The @e %cfg_traverse_items() function returns subsequent items that match @e key in a depth-first traversal of the configuration
 *          tree rooted at @e base. To traverse the tree, you call @e %cfg_traverse_items() repeatedly, each time passing the result of the
 *          previous call as @e current. The @e %cfg_traverse_items() function returns NULL when the traversal is complete.
 * @param base A pointer to the base of the configuration tree.
 * @param current A pointer to the current node of the configuration tree.
 * @param key The key value to match during the traversal.
 * @return A pointer to the next matching node in the traversal of the configuration tree.
 */
cfg_item_t  * cfg_traverse_items (const cfg_item_t *base, const cfg_item_t *current, const char *key); 

/**
 * @brief Return the string value of a node in a configuration tree
 * @details The @e %cfg_find_value() function invokes the @e cfg_find_item() function to search a configuration tree for a node that
 *          matches @e key, starting at @e node. If a match is found, its string value is returned.
 * @param node A pointer to the node to start the search from.
 * @param key A '/' separated list of node names to search for.
 * @return The string value of the matching configuration node; NULL if the item wasn't found.
 */
char              * cfg_find_value (const cfg_item_t *node, const char *key);

/**
 * @brief Return the integer value of a node in a configuration tree
 * @details The @e %cfg_find_num() function invokes the @e cfg_find_item() function to search a configuration tree for a node that
 *          matches @e key, starting at @e node. If a match is found, its integer value is returned.
 * @param node A pointer to the node to start the search from.
 * @param key A '/' separated list of node names to search for.
 * @param default_num An integer to return if the specified key isn't found.
 * @return The integer value of the matching configuration node; @e default_num if the item wasn't found.
 */
long long           cfg_find_num (const cfg_item_t *node, const char *key, long long default_num);

/**
 * @brief Find a node in a configuration tree
 * @details The @e %cfg_find_item() function performs a restricted hiearchical search starting at @e node for a node with @e cname.
 *          For example, if @e cname is "phone/digit-dialing", @e %cfg_find_item() searches for the "phone" node within the subtree of 
 *          @e node, and then searches for the "digit-dialing" node within the "phone" node.
 * @param node A pointer to the node to begin the search in.
 * @param cname A '/' separated list of node names that leads to the desired node.
 * @param levels Indicates how high up the hiearchy the search will go (0 = siblings only; -1 = all the way to the root).
 * @return A pointer to the matching configuration node; NULL if the item wasn't found.
 */
cfg_item_t        * cfg_find_item (const cfg_item_t *node, const char *cname, int levels);

/**
 * @brief Find a node in a configuration tree 
 * @details The @e %cfg_find_next_item() function performs a restricted hiearchical search for a node with @e cname.
 *          For example, if @e key is "phone/digit-dialing", @e %cfg_find_next_item() searches for the "phone" node within the subtree of 
 *          @e node, and then searches for the "digit-dialing" node within the "phone" node.
 * @param base A pointer to the parent of the current node (used only if current == NULL)
 * @param current NULL or the result of a previous call to @e cfg_find_node() or @e cfg_find_next_node().
 * @param key A '/' separated list of node names to search for.
 * @param levels Indicates how high up the hiearchy the search will go (0 = siblings only; -1 = all the way to the root).
 * @return A pointer to the next node with a matching key; NULL if the item wasn't found.
 */
cfg_item_t        * cfg_find_next_item (const cfg_item_t *base, const cfg_item_t *current, const char *key, int levels);

/**
 * @brief Find a node earlier in a configuration tree 
 * @details The @e %cfg_find_predefined_item() function performs a restricted search for a node with @e key, starting with
 *          the previous siblings of @e base, and then moving up to the parent of @e base, the previous siblings of the
 *          parent of @e base, and so on.
 * @param base  A pointer to the node to begin the search in.
 * @param key A '/' separated list of node names to search for.
 * @param levels Indicates how high up the hiearchy the search will go (0 = siblings only; -1 = all the way to the root).
 * @return A pointer to the matching configuration node; NULL if the item wasn't found.
 */
cfg_item_t        * cfg_find_predefined_item (const cfg_item_t *base, const char *key, int levels); 

/**
 * @brief Find a node higher in a configuration tree 
 * @details The @e %cfg_find_higher_item() function performs a restricted search for a node with @e key, starting with
 *          @e current and its sibling nodes, and then moving up to the parent of @e current, the siblings of the parent of
 *          @e current, and so on.
 * @param current A pointer to the node to begin the search in.
 * @param key A '/' separated list of node names to search for.
 * @return A pointer to the matching configuration node; NULL if the item wasn't found.
 */
cfg_item_t        * cfg_find_higher_item (const cfg_item_t *current, const char *key);

// accessor fuctions
/**
 * @brief Get the value of the specifed configuration item
 * @details The @e %cfg_get_key function gets the string value of the specified item. If @e item has no value, the key is returned.
 * @param item A pointer to the configuration item.
 * @return A pointer to the string value of the specified item; a pointer to the item's key if the item has no value; 
 *         NULL if @e item is NULL.
 */
char              * cfg_get_value (const cfg_item_t * item);

/**
 * @brief Get the key of the specified configuration item
 * @details The @e %cfg_get_key() function returns a pointer to the key of the specified configuration item.
 * @param item A pointer to the configuration item.
 * @return A pointer to the key string of the specified item; NULL if @e item is NULL.
 */
char              * cfg_get_key (const cfg_item_t * item);

/**
 * @brief Get the integer value of the specified configuration item
 * @details The @e %cfg_get_num() function returns the integer value of the specified configuration item.
 * @param item A pointer to the configuration item.
 * @return The value of the specified configuration item, converted to an integer.
 */
long long           cfg_get_num (const cfg_item_t * item);

/**
 * @brief Get the resolved values of the specified configuration item
 * @details The @e %cfg_resolve_value() function expands the variable references in a configuration item and
 *          returns the resolved value. For example, the item @c "prompt-dir = $(base-dir)/prompt" becomes 
 *          @c "prompt-dir = /opt/asr/prompt".
 * @param item A pointer to the configuration item.
 * @return An allocated string with all the variable references expanded.
 */ 
char              * cfg_resolve_value (const cfg_item_t *item);

/**
 * @brief Find the specified configuration item and get its resolved values 
 * @details The @e %cfg_dup_resolved_item_value() function searches for the configuration item named by @e item_path starting
 *          at the node @e item. If the item is found, it expands the variable references and returns the resolved value.
 * @param item A pointer to the configuration item to begin the search from.
 * @param item_path The path of the configuration item (e.g., "phone/digit-dialing")
 * @return An allocated string with all the variable references expanded.
 */ 
char              * cfg_dup_resolved_item_value (const cfg_item_t *item, const char *item_path);

/**
 * @brief Get an item's resolved values relative to a node 
 * @details The @e %cfg_dup_resolved_string() function expands the variable references in a configuration item relative to the specified node and
 *          returns the resolved value. 
 * @param current A pointer to the node to use to expand variables.
 * @param string The string to resolve.
 * @return An allocated string with all the variable references expanded.
 */ 
char              * cfg_dup_resolved_string( const cfg_item_t *current, char *string); // resolve string using variables relative to "current"

/**
 * @brief Get a node's next item
 * @details The @e %cfg_get_next_item() function returns the next item of @e current or the first child of @e base if 
 *          @e current is NULL. Note that the first child of @e base might be NULL.
 * @param base A pointer to the parent of @e current. Must not be NULL.
 * @param current A pointer to the node whose next node is required. Can be NULL.
 * @return A pointer to either the @e current node's next sibling or the first child of @e base.
 */ 
cfg_item_t        * cfg_get_next_item (const cfg_item_t *base, const cfg_item_t *current);

/**
 * @brief Get the parent of the specified item
 * @details The @e %cfg_get_parent() function returns the parent of the specified configuration item.
 * @param current A pointer to the configuration item.
 * @return A pointer to the parent of @e current. NULL if @e current is NULL or has no parent.
 */
cfg_item_t        * cfg_get_parent (const cfg_item_t *current); 

/**
 * @brief Get the value of the specified item
 * @details The @e %cfg_get_explicit_value() function returns the value of the specified configuration item.
 * @param item A pointer to the configuration item.
 * @return The value string of the specified item, or NULL if @e item is NULL. If there is no value a
 *         pointer to a string terminator ('\0') is returned.
 */
char              * cfg_get_explicit_value (const cfg_item_t * item);

// config file handling
/**
 * @brief Load a configuration file
 * @details The @e %cfg_load() function populates the specified configuration tree, @e base, with the contents of the
 *          configuration file specified by @e path. The @e base configuration tree isn't cleared prior to this operation,
 *          so the nodes specified within @e path are merged into @e base. Note that duplicate configuration items are permitted,
 *          so loading a configuration file twice will yield double entries.
 *  @param base A pointer to the configuration node (usually the root) to populate.
 *  @param path The filepath to the configuration file to load.
 *  @return  0 Success.
 *  @return  -1 An error occurred.
 */
int                 cfg_load(cfg_item_t *base, const char *path); // loads a config tree and roots it off of base.

// convenience encoder functions
/**
 * @brief The configuration encoder
 * @details The configuration encoder is an interim structure used to encode configurations.
 */
struct cfg_encoder {
	cfg_item_t *base;      /**< The base configuration item, which can be used as the root of a new configuration tree. */
	cfg_item_t *container; /**< The container configuration item, which sometimes becomes a child node of a @e base
	                            and sometimes is used to construct new configuration items for other uses. */
};

/**
 * @brief Create a new configuration item
 * @details The @e %cfg_encoder_init() function creates a new configuration tree from the specified configuration
 *          encoder with the specified name. The encoder base is the root of the new tree. A new configuration item with @e name
 *          is added as a child of the root. On return, the base of the encoder points to the root of the new tree;
 *          the container points to the new configuration item. 
 * @param e A pointer to the encoder that contains the items to construct the tree from.
 * @param name The name of the child item.
 * @return @e e->base, the base of the specified encoder (which points to the new tree).
 */
cfg_item_t        * cfg_encoder_init(cfg_encoder_t *e, const char *name);

/**
 * @brief Attach a configuration item to an existing configuration tree
 * @details The @e %cfg_encoder_attach() function creates a new configuration item with the specified @e name and adds it as a child 
 *          of the specifed node, @e attach, behind any existing child nodes. On return, the base and container of the encoder, @e e, 
 *          points to the new configuration item. 
 * @param e A pointer to an encoder structure.
 * @param attach A pointer to the configuration node to add the new item to.
 * @param name The name of the new configuration item.
 * @return  @e e->base, the base of the specified encoder (which points to the new tree).
 */
cfg_item_t        * cfg_encoder_attach (cfg_encoder_t *e, cfg_item_t *attach, char *name);

/**
 * @brief Clean up an encoder
 * @details The @e %cfg_encoder_cleanup() function deletes the base configuration item of the specified encoder, and also zeroes all
 *          memory utilized by the encoder structure.
 * @param e A pointer to the encoder to clean up.
 * @return Nothing.
 */
void                cfg_encoder_cleanup (cfg_encoder_t *e);

/**
 * @brief Create a new configuration item using the specified encoder
 * @details The @e %cfg_encoder_start_object() function creates a new configuration item with the specified @e name and 
 *          @e value, and then adds it as a child of the node indicated by the specified encoder's container (@e e->container).
 *          If @e e->container is NULL, it becomes a single configuration item.
 * @param e A pointer to the encoder structure.
 * @param name The name of the new configuration item.
 * @param value The value of the new configuration item.
 * @return  @e e->container, the container of the specified encoder (which points to the new configuration item).
 */
cfg_item_t        * cfg_encoder_start_object ( cfg_encoder_t *e, const char *name, const char *value);

/**
 * @brief Finish creating a new configuration item using the specified encoder
 * @details The @e %cfg_encoder_end_object() function returns the parent of the configuration item indicated by @e e->container.
 *          If there is no parent, @e e->container is returned.
 * @param e A pointer to the encoder structure indicating the new configuration item.
 * @return  @e e->container, the container of the specified encoder (which points either to the new configuration item
 *          or to its parent).
 */
cfg_item_t        * cfg_encoder_end_object ( cfg_encoder_t *e);

/**
 * @brief Add a configuration item with an integer value to an encoder
 * @details The @e %cfg_encoder_add_int() function creates a new configuration item with the specified @e name and 
 *          integer @e value and adds it as a child of the encoder container (after any other child nodes).
 * @param e A pointer to the encoder structure to add the new configuration item to.
 * @param name The name of the new configuration item.
 * @param num The integer value of the configuration item.
 * @return  A pointer to the new configuration item.
 */
cfg_item_t        * cfg_encoder_add_int (cfg_encoder_t *e, const char *name, long long num);

/**
 * @brief Add a configuration item with a string value to an encoder
 * @details The @e %cfg_encoder_add_string() function creates a new configuration item with the specified @e name and 
 *          string @e value and adds it as a child of the encoder container (after any other child nodes). Spaces and
 *          quotes are removed from the name and value before the configuration item is created.
 * @param e A pointer to the encoder structure to add the new configuration item to.
 * @param name The name of the new configuration item.
 * @param value The string value of the configuration item.
 * @return  A pointer to the new configuration item.
 */
cfg_item_t        * cfg_encoder_add_string (cfg_encoder_t *e, const char *name, const char *value);

/**
 * @brief Add a configuration item with a string value to an encoder
 * @details The @e %cfg_encoder_add_string() function creates a new configuration item with the specified @e name and 
 *          string @e value and adds it as a child of the encoder container (after any other child nodes). Spaces
 *          and quotes are removed from the name, but the value is used as specified.
 * @param e A pointer to the encoder structure to add the new configuration item to.
 * @param name The name of the new configuration item.
 * @param value The string value of the configuration item.
 * @return  A pointer to the new configuration item.
 */
cfg_item_t        * cfg_encoder_add_raw_string (cfg_encoder_t *e, const char *name, const char *value);

/**
 * @brief Strip spaces from the beginning and end of a string
 * @details The @e strip_white() function removes spaces from the beginning and end of the specified string.
 * @param buffer The string to strip spaces from.
 * @return The resulting string.
 */
char              * strip_white (char *buffer);

/**
 * @brief Find a double quote character in a string
 * @details The @e remove_quotes() function find the first double quote character in the specified string.
 * @param start The string to search.
 * @return A pointer to the double quote character.
 */
char              * find_quote (char *start);

/**
 * @brief Remove double quotes from a string
 * @details The @e remove_quotes() function removes double-quote characters from the beginning and end of the specified string.
 *          For example, @c "mystring" becomes @c mystring.
 * @param string The string to remove quotes from.
 * @return The resulting string.
 */
char              * remove_quotes (char *string);

/**
 * @brief Remove escape characters from a string
 * @details The @e strip_escapes() function removes one level of escape characters from the specified string.
 *          For example, @c "The music you specified can\'t be found" becomes "The music you specified can't be found".
 * @param string The string to remove quotes from.
 * @return The resulting string.
 */
char              * strip_escapes (char *string);

#ifdef __cplusplus
}
#endif
#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/cfg.h $ $Rev: 730767 $")
#endif
