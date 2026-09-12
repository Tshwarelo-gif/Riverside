import { FormEvent, useEffect, useState } from "react";
import type { Resource, ResourceType } from "@riverside/shared";
import { fetchAllResources, createResource, updateResource } from "../bookings/bookings.api";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";

const RESOURCE_TYPES: ResourceType[] = ["room", "equipment", "gym_slot"];

export function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("room");
  const [capacity, setCapacity] = useState("1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadResources() {
    const res = await fetchAllResources();
    setResources(res.resources);
  }

  useEffect(() => {
    loadResources();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createResource({
        name,
        type,
        capacity: Number(capacity),
        description: description || undefined,
      });
      setName("");
      setDescription("");
      setCapacity("1");
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create resource");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(resource: Resource) {
    await updateResource(resource.id, { isActive: !resource.isActive });
    await loadResources();
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-lg text-river-900">Add a resource</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5 border border-river-900/15 bg-white p-6">
          <Field id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-sm font-medium text-river-900">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className="border border-river-900/30 bg-white px-3 py-2 focus:border-river-600 focus:outline-none focus:ring-2 focus:ring-river-600/30"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <Field
            id="capacity"
            label="Capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
          <Field
            id="description"
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p className="text-sm text-gold-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? "Adding…" : "Add resource"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg text-river-900">All resources</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center justify-between border border-river-900/15 bg-white p-4">
              <div>
                <p className="font-medium text-river-900">{r.name}</p>
                <p className="text-sm text-ink/60">
                  {r.type.replace("_", " ")} · capacity {r.capacity}
                </p>
              </div>
              <button
                onClick={() => toggleActive(r)}
                className="text-sm text-ink/50 underline hover:text-ink"
              >
                {r.isActive ? "Deactivate" : "Activate"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
