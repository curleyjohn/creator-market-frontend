import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface ThemeOption {
  name: string;
  value: string;
}

interface ThemeDropdownProps {
  themes: ThemeOption[];
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}

const ThemeDropdown = ({
  themes,
  selectedTheme,
  setSelectedTheme,
}: ThemeDropdownProps) => {
  const selected = themes.find((t) => t.value === selectedTheme) ?? themes[0];

  return (
    <div className="w-40">
      <Listbox value={selected} onChange={(t) => setSelectedTheme(t.value)}>
        <div className="relative">
          <ListboxButton className="relative w-full cursor-pointer rounded bg-accent py-2 pl-3 pr-10 text-left text-accent">
            <span className="block truncate">{selected.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-accent" />
            </span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-theme py-1 text-sm shadow-lg ring-1 ring-[var(--accent)] focus:outline-none z-50">
              {themes.map((theme) => (
                <ListboxOption
                  key={theme.value}
                  value={theme}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active
                      ? "bg-accent text-accent-text"
                      : "text-theme"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-semibold" : ""}`}>
                        {theme.name}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default ThemeDropdown;
