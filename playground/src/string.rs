//! JS/Rust string interop utilities.

use std::collections::HashMap;

/// Persistent heap for byte strings.
///
/// This data structure is stored in the FFI state of a playground interpreter
/// session. It allows JS and Wasm code to read and write strings across the
/// JS/Wasm boundary.
///
/// For example, content to be eval'd on the interpreter is written to the heap
/// by JS code and then read out of the heap by Rust code so it can be passed to
/// an [`Artichoke`] instance.
///
/// [`Artichoke`]: artichoke::Artichoke
#[derive(Debug, Clone, Default)]
pub struct Heap {
    memory: HashMap<u32, Vec<u8>>,
    next_free: u32,
}

impl Heap {
    /// Construct a new, empty string heap.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let heap = Heap::new();
    /// assert_eq!(heap.capacity(), 0);
    /// ```
    pub fn new() -> Self {
        Self {
            memory: HashMap::new(),
            next_free: 0,
        }
    }

    /// Creates an empty string heap with at least the specified capacity.
    ///
    /// The string heap will be able to hold at least `capacity` elements without
    /// reallocating. This method is allowed to allocate for more elements than
    /// `capacity`. If `capacity` is 0, the hash map will not allocate.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let heap = Heap::with_capacity(100);
    /// assert!(heap.capacity() >= 100);
    /// ```
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            memory: HashMap::with_capacity(capacity),
            next_free: 0,
        }
    }

    /// Returns the number of strings the heap can hold without reallocating.
    ///
    /// This number is a lower bound; the string heap might be able to hold more,
    /// but is guaranteed to be able to hold at least this many.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let heap = Heap::with_capacity(100);
    /// assert!(heap.capacity() >= 100);
    /// ```
    pub fn capacity(&self) -> usize {
        self.memory.capacity()
    }

    /// Returns the number of strings in the heap.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// assert_eq!(a.len(), 0);
    /// a.allocate("Wasm".to_owned());
    /// assert_eq!(a.len(), 1);
    /// ```
    pub fn len(&self) -> usize {
        self.memory.len()
    }

    /// Returns `true` if the heap contains no strings.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// assert!(a.is_empty());
    /// a.allocate("Wasm".to_owned());
    /// assert!(!a.is_empty());
    /// ```
    pub fn is_empty(&self) -> bool {
        self.memory.is_empty()
    }

    /// Allocate a slot in the heap and store a UTF-8 string in it.
    ///
    /// This function returns a pointer-sized value which can be used to
    /// retrieve information about the given string from the heap.
    ///
    /// Every call to `allocate` is guaranteed to return a unique value.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// let sym = a.allocate("Wasm".to_owned());
    /// ```
    pub fn allocate(&mut self, s: String) -> u32 {
        let ptr = self.next_free;
        self.next_free += 1;
        self.memory.insert(ptr, s.into_bytes());
        ptr
    }

    /// Free the string in the heap identified by the given pointer-sized value.
    ///
    /// If `ptr` refers to a string not present in the heap, this function is a
    /// no-op.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// let sym = a.allocate("Wasm".to_owned());
    /// a.free(sym);
    /// ```
    pub fn free(&mut self, ptr: u32) {
        self.memory.remove(&ptr);
    }

    /// Retrieve the byte contents of the string in the heap identified by
    /// `ptr`.
    ///
    /// If `ptr` refers to a string not present in the heap, this function will
    /// return an empty slice.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// let sym = a.allocate("Wasm".to_owned());
    /// assert_eq!(a.string(sym), b"Wasm");
    /// assert_eq!(a.string(u32::MAX), &[]);
    /// ```
    #[must_use]
    pub fn string(&self, ptr: u32) -> &[u8] {
        self.memory.get(&ptr).map(Vec::as_slice).unwrap_or_default()
    }

    /// Retrieve the byte length of the string in the heap identified by `ptr`.
    ///
    /// If `ptr` refers to a string not present in the heap, this function will
    /// return `0`.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// let sym = a.allocate("Wasm".to_owned());
    /// assert_eq!(a.string_getlen(sym), 4);
    /// assert_eq!(a.string_getlen(u32::MAX), 0);
    /// ```
    #[must_use]
    pub fn string_getlen(&self, ptr: u32) -> u32 {
        if let Some(s) = self.memory.get(&ptr) {
            s.len() as u32
        } else {
            0
        }
    }

    /// Retrieve the byte at the given index of the string in the heap identified
    /// by `ptr`.
    ///
    /// If `ptr` refers to a string not present in the heap, this function will
    /// return `0`. If `idx` is out of bounds for the referenced string, this
    /// function will return zero.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// let sym = a.allocate("Wasm".to_owned());
    /// assert_eq!(a.string_getch(sym, 0), b'W');
    /// assert_eq!(a.string_getch(sym, 3), b'm');
    /// assert_eq!(a.string_getch(sym, 1024), 0);
    /// assert_eq!(a.string_getch(u32::MAX, 0), 0);
    /// ```
    #[must_use]
    pub fn string_getch(&self, ptr: u32, idx: u32) -> u8 {
        let s = if let Some(s) = self.memory.get(&ptr) {
            s
        } else {
            return 0;
        };
        let idx = if let Ok(idx) = usize::try_from(idx) {
            idx
        } else {
            return 0;
        };
        s.get(idx).copied().unwrap_or_default()
    }

    /// Modify the string in the heap identified by `ptr` by appending a byte
    /// to its end.
    ///
    /// If `ptr` refers to a string not present in the heap, this function is a
    /// no-op.
    ///
    /// # Examples
    ///
    /// ```
    /// use playground::string::Heap;
    ///
    /// let mut a = Heap::new();
    /// let sym = a.allocate("Wasm".to_owned());
    /// a.string_putch(sym, b'!');
    /// assert_eq!(a.string(sym), b"Wasm!");
    /// ```
    pub fn string_putch(&mut self, ptr: u32, ch: u8) {
        if let Some(s) = self.memory.get_mut(&ptr) {
            s.push(ch);
        }
    }
}
