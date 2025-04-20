import { Listbox, Transition } from "@headlessui/react";
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
          <Listbox.Button className="relative w-full cursor-pointer rounded bg-[var(--accent)] py-2 pl-3 pr-10 text-left text-[var(--accent-text)]">
            <span className="block truncate">{selected.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-[var(--accent-text)]" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-sm shadow-lg ring-1 ring-black/10 focus:outline-none z-50">
              {themes.map((theme) => (
                <Listbox.Option
                  key={theme.value}
                  value={theme}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-black" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-semibold" : ""}`}>
                        {theme.name}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-electricBlue">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default ThemeDropdown;
